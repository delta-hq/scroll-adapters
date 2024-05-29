# scroll-adapters
## TVL by User - Adapters

### Onboarding Checklist
Please complete the following:

1.  Set up a subquery indexer (e.g. Goldsky Subgraph)
    1.  Follow the docs here: https://docs.goldsky.com/guides/create-a-no-code-subgraph
    2. General Steps
        1.  create an account at app.goldsky.com
        2.  deploy a subgraph or migrate an existing subgraph - https://docs.goldsky.com/subgraphs/introduction
        3.  Use the slugs `scroll-testnet` and `scroll` when deploying the config
2.  Prepare Subquery query code according to the Data Requirement section below.
3.  Submit your response as a Pull Request to: https://github.com/delta-hq/scroll-adapters
    1.  With path being `/<your_protocol_handle>` 


### Code Changes Expected

1. Create a function like below:
```
  export const getUserTVLByBlock = async (blocks: BlockData) => {
      const { blockNumber, blockTimestamp } = blocks
          //    Retrieve data using block number and timestamp
        // YOUR LOGIC HERE
      
      return csvRows

  };
```
2. Interface for input Block Data is, in below blockTimestamp is in epoch format.
 ``` 
  interface BlockData {
    blockNumber: number;
    blockTimestamp: number;
}
```
3. Output "csvRow" is a list. 
```
const csvRows: OutputDataSchemaRow[] = [];

  type OutputDataSchemaRow = {
      block_number: number;
      timestamp: number;
      user_address: string;
      token_address: string;
      token_balance: bigint;
      token_symbol: string; //token symbol should be empty string if it is not available
      usd_price: number; //assign 0 if not available
  };
```
4. Make sure you add relevant package.json and tsconfig.json


### Data Requirement
Goal: **Hourly snapshot of TVL by User by Asset**

For each protocol, we are looking for the following: 
1.  Query that fetches all relevant events required to calculate User TVL in the Protocol at hourly level.
2.  Code that uses the above query, fetches all the data and converts it to csv file in below given format.
3.  Token amount should be raw token amount. Please do not divide by decimals.

Teams can refer to the example we have in there to write the code required.

### Output Data Schema

| Data Field                | Notes                                                                                  |
|---------------------------|----------------------------------------------------------------------------------------|
| block_number              |                                                                                        |
| timestamp                 | Block timestamp                                                                        |
| user_address              |                                                                                        |
| token_address             |                                                                                        |
| token_symbol (optional)   | Symbol of token                                                                        |
| token_balance             | Balance of token (**If the token was borrowed, this balance should be negative**)      |
| usd_price (from oracle)   | Price of token (optional)                                                              |


Sample output row will look like this:

| blocknumber | timestamp | user_address | token_address | token_balance | token_symbol (optional) | usd_price(optional)|
|---|---|---|---|---|---|---|
| 2940306 | 2024-03-16 19:19:57 | 0x4874459FE…d689 | 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 | 100 | WETH | 0|

Note: **Expect multiple entries per user if the protocols has more than one token asset**

### index.ts
On this scope, the code must read a CSV file with headers named `hourly_blocks.csv` that contains the following columns:
- `number` - block number
- `timestamp` - block timestamp

And output a CSV file named `outputData.csv` with headers with the following columns:
- `block_number` - block number
- `timestamp` - block timestamp
- `user_address` - user address
- `token_address` - token address
- `token_symbol` - token symbol
- `token_balance` - token balance
- `usd_price` - USD price
e.g. `adapters/renzo/src/index.ts`

For testing the adapter code for a single hourly block, use the following `hourly_blocks.csv` file:
``` 
number,timestamp
4243360,1714773599
```

### Adapter Example
In this repo, there is an adapter example. This adapter aims to get data positions from the subrgaph and calculate the TVL by users.
The main scripts is generating a output as CSV file.

[Adapter Example](adapters/example/dex/src/index.ts)

## Notes
1. Please make sure to have a "compile" script in package.json file. So, we are able to compile the typescript files into `dist/index.js` file.

## How to execute this project?

```
npm install // install all packages
npm run watch //other terminal tab
npm run start // other terminal tab
```

By this, we'll be able to generate the output csv file.
