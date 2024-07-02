import fs from "fs";
import { write } from "fast-csv";
import { getUserTVLByBlock, readBlocksFromCSV } from "./sdk";
import path from "path";

const filePath = path.join(process.cwd(), "hourly_blocks.csv");

async function processBlocks() {
  try {
    const blocks = await readBlocksFromCSV(filePath);
    console.log(`Read ${blocks.length} blocks from CSV.`);

    const allCsvRows: any[] = [];

    for (const block of blocks) {
      try {
        const result = await getUserTVLByBlock(block);
        allCsvRows.push(...result); // Assuming result is an array of objects
      } catch (error) {
        console.error(`An error occurred for block ${block.blockNumber}:`, error);
      }
    }

    const ws = fs.createWriteStream(path.join(process.cwd(), "outputData.csv"), { flags: "w" });
    write(allCsvRows, { headers: true }).pipe(ws);

    await new Promise((resolve, reject) => {
      ws.on("finish", () => {
        console.log(`CSV file has been written.`);
      });
      ws.on("error", (err) => {
        console.error("Error writing CSV file:", err);
        reject(err); // Reject the promise if there's an error
      });
    });

  } catch (err) {
    console.error("Error reading or processing CSV file:", err);
  }
}

// Invoke the main processing function
processBlocks();
