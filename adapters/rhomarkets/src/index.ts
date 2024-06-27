import fs from "fs";
import { write } from "fast-csv";
import { getUserTVLByBlock, readBlocksFromCSV } from "./sdk";
import path from "path";

const filePath = path.join(process.cwd(), "hourly_blocks.csv");

readBlocksFromCSV(filePath)
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
    await new Promise((resolve) => {
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
