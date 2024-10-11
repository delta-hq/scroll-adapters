import fs from "fs";
import csv from "csv-parser";
import { write } from "fast-csv";

export interface BlockData {
  blockNumber: number;
  blockTimestamp: number;
}

export interface OutputDataSchemaRow {
  user_address: string;
  market: string;
  token_address: string;
  underlying_decimals: number;
  token_symbol: string;
  supply_token: number;
  borrow_token: number;
  block_number: number;
  timestamp: number;
  protocol: string;
  etl_timestamp: number;
};

export const readBlocksFromCSV = async (filePath: string): Promise<BlockData[]> => {
  const blocks: BlockData[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv()) // Specify the separator as '\t' for TSV files
      .on("data", (row) => {
        const blockNumber = parseInt(row.number, 10);
        const blockTimestamp = parseInt(row.timestamp, 10);
        if (!isNaN(blockNumber) && blockTimestamp) {
          blocks.push({ blockNumber, blockTimestamp });
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

export const writeOutputToCSV = async (filePath: string, data: OutputDataSchemaRow[]): Promise<void> => {
  await new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(filePath, { flags: "w" });
    write(data, { headers: true })
      .pipe(ws)
      .on("finish", () => {
        resolve;
      });
  });
}