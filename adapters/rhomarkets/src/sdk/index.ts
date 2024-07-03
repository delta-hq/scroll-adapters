import fs from "fs";
import csv from "csv-parser";
import { scroll } from "viem/chains";
import { fetchGraphQLData } from "./request";
import { getMarketInfos } from "./marketDetails";
import { createPublicClient, extractChain, formatUnits, http } from "viem";
import { CHAINS, PROTOCOLS, RPC_URLS } from "./config";
import ltokenAbi from "./abi/ltoken.abi";

export interface BlockData {
  blockNumber: number;
  blockTimestamp: number;
}

type OutputDataSchemaRow = {
  user_address: string;
  market: string;
  token_address: string;
  token_symbol: string;
  supply_token: bigint;
  borrow_token: bigint;
  block_number: number;
  timestamp: number;
  protocol: string;
  etl_timestamp: number;
};

export const getUserTVLByBlock = async (blocks: BlockData) => {
  const protocalInfos = await fetchGraphQLData(
    blocks.blockNumber,
    CHAINS.SCROLL,
    PROTOCOLS.RHO_MARKETS
  );

  const marketInfos = await getMarketInfos(
    "0x8a67AB98A291d1AEA2E1eB0a79ae4ab7f2D76041",
    BigInt(blocks.blockNumber)
  );

  const marketsMapping: any = {};
  for (let marketInfo of marketInfos) {
    marketsMapping[marketInfo.address] = {
      address: marketInfo.address,
      exchangeRate: marketInfo.exchangeRateStored,
      decimals: marketInfo.decimals,
      tokenAddress: marketInfo.underlyingAddress,
      tokenSymbol: marketInfo.underlyingSymbol,
    };
  }

  const publicClient = createPublicClient({
    chain: extractChain({ chains: [scroll], id: CHAINS.SCROLL }),
    transport: http(RPC_URLS[CHAINS.SCROLL]),
  });

  console.log(
    `Will update all borrow balances for ${protocalInfos.length} states`
  );
  for (var i = 0; i < protocalInfos.length; i += 1000) {
    const start = i;
    const end = i + 1000;
    var subStates = protocalInfos.slice(start, end);
    console.log(`Updating borrow balances for ${start} - ${end}`);

    let borrowBalanceResults = await publicClient.multicall({
      contracts: subStates
        .map((m) => {
          return [
            {
              address: m.market,
              abi: ltokenAbi,
              functionName: "borrowBalanceStored",
              args: [m.user_address],
            },
          ];
        })
        .flat() as any,
      blockNumber: BigInt(blocks.blockNumber),
    });

    let supplyBalanceResults = await publicClient.multicall({
      contracts: subStates
        .map((m) => {
          return [
            {
              address: m.market,
              abi: ltokenAbi,
              functionName: "balanceOf",
              args: [m.user_address],
            },
          ];
        })
        .flat() as any,
      blockNumber: BigInt(blocks.blockNumber),
    });

    for (var j = 0; j < subStates.length; j++) {
      subStates[j].borrow_token = Number(
        formatUnits(
          (borrowBalanceResults[j]?.result as bigint) || 0n,
          marketsMapping[subStates[j].market].decimals
        )
      );

      subStates[j].supply_token = Number(
        formatUnits(
          (((supplyBalanceResults[j]?.result as bigint) || 0n) *
            marketsMapping[subStates[j].market].exchangeRate) /
            10n ** 18n,
          marketsMapping[subStates[j].market].decimals
        )
      );
    }
  }

  // filter out rows with no supply/borrow
  const newStates: any[] = protocalInfos.filter(
    (x) =>
      (x.borrow_token > 0 || x.supply_token > 0) && x.market && x.user_address
  );

  const csvRows: OutputDataSchemaRow[] = newStates.map((item) => {
    const marketInfo = marketsMapping[item.market];
    return {
      protocol: "RhoMarkets",
      timestamp: blocks.blockTimestamp,
      block_number: blocks.blockNumber,
      etl_timestamp: Math.floor(Date.now() / 1000),
      token_address: marketInfo.tokenAddress,
      token_symbol: marketInfo.tokenSymbol,
      user_address: item.user_address,
      market: item.market,
      supply_token: item.supply_token,
      borrow_token: item.borrow_token,
    };
  });

  return csvRows;
};

export const readBlocksFromCSV = async (
  filePath: string
): Promise<BlockData[]> => {
  const blocks: BlockData[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ separator: "," }))
      .on("data", (row) => {
        const blockNumber = parseInt(row.number, 10);
        const blockTimestamp = parseInt(row.timestamp, 10);

        if (!isNaN(blockNumber) && !isNaN(blockTimestamp)) {
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
