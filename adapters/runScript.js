// runScript.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { write } = require('fast-csv');

// Get the folder name from command line arguments
const folderName = process.argv[2];

if (!folderName) {
  console.error('Folder name not provided. Please provide the folder name as an argument.');
  process.exit(1);
}

// Get the absolute path of the provided folder
const folderPath = path.resolve(folderName);

// Check if the provided folder exists
if (!fs.existsSync(folderPath)) {
  console.error(`Folder '${folderName}' does not exist.`);
  process.exit(1);
}

// Check if the provided folder contains dist/index.js file
const indexPath = path.join(folderPath, 'dist/index.js');
if (!fs.existsSync(indexPath)) {
  console.error(`Folder '${folderName}' does not contain dist/index.js file. Please compile index.ts`);
  process.exit(1);
}

// Import the getUserTVLByBlock function from the provided folder
const { getUserTVLByBlock } = require(indexPath);

const readBlocksFromCSV = async (filePath) => {
  const blocks = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath, { encoding: 'utf8' })
      .pipe(csv({
        separator: ',', // Specify the separator as '\t'
        mapHeaders: ({ header, index }) => header.trim() // Trim headers to remove any leading/trailing spaces
      }))
      .on('data', (row) => {
        console.log(row)
        const blockNumber = parseInt(row.number, 10);
        const blockTimestamp = parseInt(row.timestamp, 10);
        if (!isNaN(blockNumber) && blockTimestamp) {
          blocks.push({ blockNumber, blockTimestamp });
        }
      })
      .on('end', () => {
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      });
  });

  return blocks;
};

// Log the full path to the CSV file
const csvFilePath = path.join(folderPath, 'hourly_blocks.csv');
console.log(`Looking for hourly_blocks.csv at: ${csvFilePath}`);

// Additional check for file existence before proceeding
if (!fs.existsSync(csvFilePath)) {
  console.error(`File '${csvFilePath}' does not exist.`);
  process.exit(1);
}

// Main function to coordinate the processing
const main = async () => {
  try {
    const blocks = await readBlocksFromCSV(csvFilePath);

    console.log('Blocks read from CSV:', blocks);

    const allCsvRows = []; // Array to accumulate CSV rows for all blocks
    const batchSize = 10; // Size of batch to trigger writing to the file
    let i = 0;

    for (const block of blocks) {
      try {
        const result = await getUserTVLByBlock(block);

        console.log(`Result for block ${block.blockNumber}:`, result); // Print the result for verification

        // Accumulate CSV rows for all blocks
        allCsvRows.push(result);

        i++;
        console.log(`Processed block ${i}`);

        // Write to file when batch size is reached or at the end of loop
        if (i % batchSize === 0 || i === blocks.length) {
          const ws = fs.createWriteStream(`${folderName}/outputData.csv`, { flags: i === batchSize ? 'w' : 'a' });
          write(allCsvRows, { headers: i === batchSize ? true : false })
            .pipe(ws)
            .on("finish", () => {
              console.log(`CSV file has been written.`);
            });

          // Clear the accumulated CSV rows
          allCsvRows.length = 0;
        }
      } catch (error) {
        console.error(`An error occurred for block ${block.blockNumber}:`, error);
      }
    }
  } catch (err) {
    console.error('Error reading CSV file:', err);
  }
};

// Run the main function and ensure the process waits for it to complete
main().then(() => {
  console.log('Processing complete.');
  process.exit(0);
}).catch((err) => {
  console.error('An error occurred:', err);
  process.exit(1);
});
