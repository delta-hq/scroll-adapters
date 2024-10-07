import { createPublicClient, extractChain, http, getContract } from "viem";
import {
  CHAINS,
  FIXED_BLOCK_NUMS,
  FIXED_EXCHANGE_RATE,
  RPC_URLS,
  rUSDC_ADDRESS,
} from "./config";
import { scroll } from "viem/chains";
import coreAbi from "./abi/core.abi";
import ltokenAbi from "./abi/ltoken.abi";

export interface MarketInfo {
  address: string;
  decimals: number;
  underlyingAddress: string;
  underlyingSymbol: string;
  exchangeRateStored: bigint;
}

export const getMarketInfos = async (
  coreAddress: `0x${string}`,
  blockNumber?: bigint
) => {
  const publicClient = createPublicClient({
    chain: extractChain({ chains: [scroll], id: CHAINS.SCROLL }),
    transport: http(RPC_URLS[CHAINS.SCROLL]),
  });

  const core = getContract({
    address: coreAddress,
    abi: coreAbi,
    client: publicClient,
  });

  const marketAddresses: `0x${string}`[] =
    ((await core.read.getAllMarkets()) as any) || [];

  console.log("marketAddresses ", marketAddresses);

  const markets = marketAddresses.map((m) =>
    getContract({
      address: m,
      abi: ltokenAbi,
      client: publicClient,
    })
  );

  const underlyingResults = await publicClient.multicall({
    contracts: markets.map((m) => ({
      address: m.address,
      abi: m.abi,
      functionName: "underlying",
    })) as any,
  });

  const decimalResults = await publicClient.multicall({
    contracts: markets.map((m) => ({
      address: m.address,
      abi: m.abi,
      functionName: "decimals",
    })) as any,
  });

  const underlyingAddresses = underlyingResults.map(
    (v) => v.result as `0x${string}`
  );

  const underlyings = underlyingAddresses.map((m) =>
    getContract({
      address: m as `0x${string}`,
      abi: ltokenAbi,
      client: publicClient,
    })
  );

  const underlyingSymbolResults = await publicClient.multicall({
    contracts: underlyings.map((m) => ({
      address: (m as any).address,
      abi: (m as any).abi,
      functionName: "symbol",
    })) as any,
  });

  let exchangeRateResults = await publicClient.multicall({
    contracts: markets.map((m) => ({
      address: m.address,
      abi: m.abi,
      functionName: "exchangeRateStored",
    })) as any,
    blockNumber,
  });

  const marketInfos: MarketInfo[] = [];

  for (let i = 0; i < markets.length; i++) {
    const marketAddress = markets[i].address.toLowerCase();
    const underlyingAddress = underlyingAddresses[i];

    // Fix rUSDC exchange rate issue that occurred between blocks 9664314 and 9671174
    const fixedUSDCBlockData =
      marketAddress.toLowerCase() === rUSDC_ADDRESS.toLowerCase() &&
      blockNumber &&
      blockNumber > FIXED_BLOCK_NUMS[0] &&
      blockNumber < FIXED_BLOCK_NUMS[1];

    marketInfos.push({
      address: marketAddress,
      underlyingAddress,
      decimals: (decimalResults[i].result as number) || 0,
      underlyingSymbol: (underlyingSymbolResults[i].result as any) || "ETH",
      exchangeRateStored: fixedUSDCBlockData
        ? FIXED_EXCHANGE_RATE
        : BigInt(
            exchangeRateResults[i].status === "success"
              ? (exchangeRateResults[i].result as any)
              : 0
          ),
    });
  }

  return marketInfos;
};
