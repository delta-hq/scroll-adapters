# scroll-adapters

### Onboarding Checklist

Please complete the following:

- [ ] Read this document and explore the other adapters (see `adapters/example`)
- [ ] See the schema that we are requesting based on your protocol type (currently supporting, lending and perps)
- [ ] Submit a PR with progress with a new folder containing your adapter (in `adapter/{protocol-name}`)
- [ ] Build your adapter
  - [ ] Ensure your `package.json` has a `start` command that executes the proper code
  - [ ] Follow the schema/output format, standard input file format, and standard function inputs
  - [ ] Ensure the adapter runs and executes in the proper workflow (see: `How to execute this project?`)
- [ ] QA your data
- [ ] Notify our team when you are ready for a review!

## How to execute this project?

### Standard Adapter Flow

1. Call standard function and input block number read from `hourly_blocks.csv`
2. Build a pandas dataframe with the user level data for at the given block
3. Query the subgraph/make `eth_call`s (ensure they are historical) to get all of the data
   1. Tip: use `viem` `multicall()` to save time and rpc compute
4. Write the data to `outputData.csv`

### Standard Execution Flow (detailed)

Create your block file (`adapters/{protocol-name}/hourly_blocks.csv`) using **comma-delineated** csv.

Example:

```csv
number,timestamp
6916213,1719322991
```

Run these commands:

```bash
cd adapters/{protocol-name}
npm install
tsc
npm run start # should execute node dist/index.js
```

Your adapter should write the data to a csv file named `adapters/{protocol-name}/outputData.csv` following the proper schema below.

## Schema Requirements

Generally each row corresponds to a user / market pair at a given block.

Please note the following:

- We will be querying **hourly snapshots of user level data by asset/market**
- A standard function / entry point that inputs a block number and fetches all user level data at that block. (see below)
- Accepts the standard input defined in `hourly_blocks.csv` (see more details below)
- All values are in the underlying token amount (no lp or output tokens such as, cTokens, aTokens, uni pools)
- Token amounts are normalized
- All strings/addresses are lowercase with no spaces

> Note: **Expect multiple entries per user if the protocol has more than one token asset**

### Lending Schema

| Data Field                | Notes                                                                                  |
|---------------------------|----------------------------------------------------------------------------------------|
| protocol                  | Name of the protocol (no spaces, should match the folder name)                         |
| block_number              |                                                                                        |
| timestamp                 | Block timestamp                                                                        |
| user_address              | The address of the user who's data is being recorded                                   |
| market                    | The smart contract address of the market                                               |
| token_address             | The smart contract address of the underlying token for this position                   |
| token_symbol              | Symbol of the underlying token                                                         |
| supply_token              | Balance of the supplied amount in this market from `user_address`                      |
| borrow_token              | balance of the borrowed amount in this market from `user_address`                      |
| etl_timestamp             | Run timestamp of this row                                                              |

### Perps Schema

| Data Field                | Notes                                                                                  |
|---------------------------|----------------------------------------------------------------------------------------|
| protocol                  | Name of the protocol (no spaces, should match the folder name)                         |
| block_number              |                                                                                        |
| timestamp                 | Block timestamp                                                                        |
| user_address              | The address of the user who's data is being recorded                                   |
| market                    | The smart contract address of the market                                               |
| trade_pair_symbol         | Symbol of the trade pair                                                               |
| daily_user_volume_usd     | The cumulative volume of this user for this trade pair for the preceding 24h in USD    |
| funding_rate              | The funding rate for this trade pair (in percentage, ie: 63.4 = 63.4%)                 |
| supplied_amount_usd       | The TVL or deposited amount of this user for this trade pair at this timestamp in USD (same as UI) |
| open_shorts_usd           | Total notional value (in USD) of the shorts for this trade pair of the user            |
| open_longs_usd            | Total notional value (in USD) of the longs for this trade pair of the user             |
| protocol_fees_usd         | Revenue fees for the protocol in USD, generated from this user and trade pair (cumulative for the preceding 24h) |
| users_fees_usd            | Revenue fees for the users (LP / takers) in USD, generated from this user and trade pair (cumulative for the preceding 24h) |
| etl_timestamp             | Run timestamp of this row                                                              |

## Code Expectations

### Standard Input function

This is a general guideline to help begin your project. See the following examples for how to call this function and write to `outputData.csv`:

- [Example](./adapters/example/dex/src/index.ts)
- [Layerbank](./adapters/layerbank/src/index.ts) (compound v2 fork)
- [Rhomarkets](./adapters/rhomarkets/src/index.ts) (compound v2 fork)

```typescript
  export const getUserDataByBlock = async (blocks: BlockData) => {
      const { blockNumber, blockTimestamp } = blocks
          // Retrieve data using block number and timestamp
          // YOUR LOGIC HERE
      
      return csvRows
  };
```

### Standard Interfaces

It is good practice to provide typing of newly defined data structures in typescript. Let's take a look at how we can standardize these based on your protocol type.

**Input Data Type**

```typescript
interface BlockData {
  blockNumber: number;
  blockTimestamp: number;
}
```

**Lending Schema Output**

```typescript
const csvRows: OutputDataSchemaRow[] = [];

type OutputDataSchemaRow = {
  // User / Market data
  user_address: string;
  market: string;
  token_address: string;
  token_symbol: string;

  // Financial data
  supply_token: bigint;
  borrow_token: bigint;

  // Metadata
  block_number: number;
  timestamp: number;
  protocol: string;
  etl_timestamp: number;
};
```

**Perps Schema Output**

```typescript
const csvRows: OutputDataSchemaRow[] = [];

type OutputDataSchemaRow = {
  // User / Market info
  user_address: string;
  market: string;
  trade_pair_symbol: string;
  funding_rate: number;

  // Financial data
  daily_user_volume_usd: number;
  supplied_amount_usd: number;
  open_shorts_usd: number;
  open_longs_usd: number;
  protocol_fees_usd: number;
  users_fees_usd: number;
  
  // Metadata
  protocol: string;
  block_number: number;
  timestamp: number;
  etl_timestamp: number;
};
```

## Deploying a Subgraph using Goldsky

1. Set up a subquery indexer (e.g. Goldsky Subgraph)
    1. Follow the docs here: <https://docs.goldsky.com/guides/create-a-no-code-subgraph>
    2. General Steps
        1. create an account at app.goldsky.com
        2. deploy a subgraph or migrate an existing subgraph - <https://docs.goldsky.com/subgraphs/introduction>
        3. Use the slugs `scroll-testnet` and `scroll` when deploying the config
2. Prepare Subquery query code according to the Schema Requirements section

## Adapter Example

In this repo, there is an adapter example. This adapter aims to get data positions from the subrgaph and calculate the TVL by users.
The main scripts is generating a output as CSV file.

[Adapter Example](adapters/example/dex/src/index.ts)
