import fs from "fs";
import csv from "csv-parser";
import { fetchGraphQLData } from "./request";

export interface BlockData {
  blockNumber: number;
  blockTimestamp: number;
}

export type OutputDataSchemaRow = {
  protocol: string;
  date: number;
  block_number: number;
  user_address: string;
  market: string;
  supply_token: string | number;
  borrow_token: string | number;
};

export const getUserTVLByBlock = async (blocks: BlockData) => {
  const protocalInfos = await fetchGraphQLData(blocks.blockNumber);

  const csvRows: OutputDataSchemaRow[] = protocalInfos.map((item) => ({
    protocol: "RhoMarkets",
    date: blocks.blockTimestamp,
    block_number: blocks.blockNumber,
    user_address: item.user_address,
    market: item.market,
    supply_token: item.supply_token,
    borrow_token: item.borrow_token,
  }));

  return csvRows;
};

export const readBlocksFromCSV = async (
  filePath: string
): Promise<BlockData[]> => {
  const blocks: BlockData[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ separator: "\t" })) // Specify the separator as '\t' for TSV files
      .on("data", (row) => {
        const blockNumber = parseInt(row.number, 10);
        const blockTimestamp = parseInt(row.block_timestamp, 10);

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
