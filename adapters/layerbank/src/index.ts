import { CHAINS, PROTOCOLS } from "./sdk/config";
import {
  getAccountStatesForAddressByPoolAtBlock,
} from "./sdk/subgraphDetails";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import fs from "fs";
import csv from "csv-parser";
import { write } from "fast-csv";
import { getMarketInfos, updateBorrowBalances } from "./sdk/marketDetails";

interface BlockData {
  blockNumber: number;
  blockTimestamp: number;
}

type OutputDataSchemaRow = {
  user_address: string;
  market: string;
  token_address: string;
  token_symbol: string;
  supply_token: number;
  borrow_token: number;
  block_number: number;
  timestamp: number;
  protocol: string;
  etl_timestamp: number;
};

export const getUserTVLByBlock = async (blocks: BlockData) => {
  const marketInfos = await getMarketInfos(
    "0xEC53c830f4444a8A56455c6836b5D2aA794289Aa"
  );

  const csvRows: OutputDataSchemaRow[] = [];
  const block = blocks.blockNumber;

  let states = await getAccountStatesForAddressByPoolAtBlock(
    block,
    "",
    "",
    CHAINS.SCROLL,
    PROTOCOLS.LAYERBANK
  );
  states = states.filter(
    (s) => marketInfos.findIndex((lu) => lu.address == s.account) == -1
  );

  console.log(`Block: ${block}`);
  console.log("States: ", states.length);

  await updateBorrowBalances(states, BigInt(block));

  states.forEach((state) => {
    const marketInfo = marketInfos.find(
      (mi) => mi.underlyingAddress.toLowerCase() === state.token.toLowerCase()
    );
  
    // Check if marketInfo is defined before pushing to csvRows
    if (marketInfo) {
      csvRows.push({
        protocol: "Layerbank",
        timestamp: blocks.blockTimestamp,
        block_number: blocks.blockNumber,
        etl_timestamp: Math.floor(Date.now() / 1000),
        token_address: marketInfo.underlyingAddress.toLowerCase(),
        token_symbol: marketInfo.underlyingSymbol,
        user_address: state.account.toLowerCase(),
        market: marketInfo.address.toLowerCase(),
        supply_token: state.lentAmount,
        borrow_token: state.borrowAmount,
      });
    } else {
      console.warn(`Market info not found for token: ${state.token}`);
    }
  });  

  return csvRows;
};

const readBlocksFromCSV = async (filePath: string): Promise<BlockData[]> => {
  const blocks: BlockData[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv()) // Specify the separator as '\t' for TSV files
      .on("data", (row) => {
        const blockNumber = parseInt(row.number, 10);
        const blockTimestamp = parseInt(row.timestamp, 10);
        if (!isNaN(blockNumber) && blockTimestamp) {
          blocks.push({ blockNumber: blockNumber, blockTimestamp });
        }
      })
      .on("end", () => {
        resolve();
      })
      .on("error", (err) => {
        reject(err);
      });
  });

  return blocks;
};

readBlocksFromCSV("hourly_blocks.csv")
  .then(async (blocks: any[]) => {
    console.log(blocks);
    const allCsvRows: any[] = []; // Array to accumulate CSV rows for all blocks

    for (const block of blocks) {
      try {
        const result = await getUserTVLByBlock(block);
        for (let i = 0; i < result.length; i++) {
          allCsvRows.push(result[i]);
        }
      } catch (error) {
        console.error(`An error occurred for block ${block}:`, error);
      }
    }
    await new Promise((resolve, reject) => {
      const ws = fs.createWriteStream(`outputData.csv`, { flags: "w" });
      write(allCsvRows, { headers: true })
        .pipe(ws)
        .on("finish", () => {
          console.log(`CSV file has been written.`);
          resolve;
        });
    });
  })
  .catch((err) => {
    console.error("Error reading CSV file:", err);
  });
