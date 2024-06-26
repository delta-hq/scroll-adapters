import fs from "fs";
import csv from "csv-parser";
import { scroll } from "viem/chains";
import { fetchGraphQLData } from "./request";
import { getMarketInfos } from "./marketDetails";
import {
  createPublicClient,
  extractChain,
  formatUnits,
  http,
  zeroAddress,
} from "viem";
import { CHAINS, PROTOCOLS, RPC_URLS } from "./config";
import ltokenAbi from "./abi/ltoken.abi";

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
  const protocalInfos = await fetchGraphQLData(
    blocks.blockNumber,
    CHAINS.SCROLL,
    PROTOCOLS.RHO_MARKETS
  );

  const marketInfos = await getMarketInfos(
    "0x8a67AB98A291d1AEA2E1eB0a79ae4ab7f2D76041"
  );

  const newStates: any[] = protocalInfos.filter(
    (x) =>
      (x.borrow_token > 0 || x.supply_token > 0) && x.market && x.user_address
  );

  const marketsMapping: any = {};
  for (let marketInfo of marketInfos) {
    marketsMapping[marketInfo.address] = {
      address: marketInfo.address,
      exchangeRate: marketInfo.exchangeRateStored,
      decimals: marketInfo.decimals,
    };
  }

  const publicClient = createPublicClient({
    chain: extractChain({ chains: [scroll], id: CHAINS.SCROLL }),
    transport: http(RPC_URLS[CHAINS.SCROLL]),
  });

  console.log(`Will update all borrow balances for ${newStates.length} states`);
  for (var i = 0; i < newStates.length; i += 1000) {
    const start = i;
    const end = i + 1000;
    var subStates = newStates.slice(start, end);
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
      subStates[j].borrow_token = formatUnits(
        (borrowBalanceResults[j]?.result as bigint) || 0n,
        subStates[j].decimals
      );

      subStates[j].supply_token = formatUnits(
        (((supplyBalanceResults[j]?.result as bigint) || 0n) *
          marketsMapping[subStates[j].market].exchangeRate) /
          10n ** 18n,
        marketsMapping[subStates[j].market].decimals
      );

      if (
        subStates[j].user_address.toLowerCase() ===
        "0x5fa5fbe3365d4317fbaa6df9b64f2262efdc771e".toLowerCase()
      ) {
        console.log(
          "marketsMapping[subStates[j].market].decimals ",
          marketsMapping[subStates[j].market].decimals
        );
      }

      // console.log(
      //   `user: ${subStates[j].user_address} supply: ${subStates[j].supply_token} borrowed: ${subStates[j].borrow_token}`
      // );
    }
  }

  const csvRows: OutputDataSchemaRow[] = newStates.map((item) => {
    return {
      protocol: "RhoMarkets",
      date: blocks.blockTimestamp,
      block_number: blocks.blockNumber,
      user_address: item.user_address,
      market: item.market,
      supply_token: item.supply_token,
      borrow_token: item.borrow_token,
    };
  });

  return csvRows.slice(0, 1000);
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
