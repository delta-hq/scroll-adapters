import { CHAINS, PROTOCOLS } from "./sdk/config";
import {
  getAccountStatesForAddressByPoolAtBlock,
  getTimestampAtBlock,
} from "./sdk/subgraphDetails";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import fs from "fs";
import csv from "csv-parser";
import { write } from "fast-csv";
import { getMarketInfos, updateBorrowBalances } from "./sdk/marketDetails";
import { bigMath } from "./sdk/abi/helpers";
import { exit } from "process";

interface BlockData {
  blockNumber: number;
  blockTimestamp: number;
}

type OutputDataSchemaRow = {
  protocol: string;
  date: number;
  block_number: number;
  user_address: string;
  market: string;
  supply_token: bigint;
  borrow_token: bigint;
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
      (mi) => mi.underlyingAddress == state.token.toLowerCase()
    );

    // Accumulate CSV row data
    csvRows.push({
      protocol: "Layerbank",
      date: blocks.blockTimestamp,
      block_number: blocks.blockNumber,
      user_address: state.account,
      market: state.token,
      supply_token: state.lentAmount,
      borrow_token: state.borrowAmount,
    });
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
