import { createPublicClient, extractChain, http, getContract } from "viem";
import { CHAINS, RPC_URLS } from "./config";
import { scroll } from "viem/chains";
import coreAbi from "./abi/core.abi";
import ltokenAbi from "./abi/ltoken.abi";

export interface MarketInfo {
  address: string;
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

  const exchangeRateResults = await publicClient.multicall({
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

    marketInfos.push({
      address: marketAddress,
      underlyingAddress,
      underlyingSymbol: (underlyingSymbolResults[i].result as any) || "ETH",
      exchangeRateStored: BigInt(
        exchangeRateResults[i].status === "success"
          ? (exchangeRateResults[i].result as any)
          : 0
      ),
    });
  }

  return marketInfos;
};
