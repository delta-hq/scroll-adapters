import { formatUnits, createPublicClient, extractChain, http } from "viem";
import { scroll } from "viem/chains";
import {
  CHAINS,
  PROTOCOLS,
  RPC_URLS,
  SUBGRAPH_URLS,
  WETH_ADDRESS,
} from "./config";
import { getMarketInfos } from "./marketDetails";

// Define the zero address and dead address constants
const zeroAddress = "0x0000000000000000000000000000000000000000";
const deadAddress = "0x000000000000000000000000000000000000dead";

export interface AccountState {
  id: string;
  account: string;
  token: string;
  lentAmount: number;
  borrowAmount: number;
}

export const getAccountStatesForAddressByPoolAtBlock = async (
  blockNumber: number,
  address: string,
  poolId: string,
  chainId: CHAINS,
  protocol: PROTOCOLS
): Promise<AccountState[]> => {
  const marketInfos = await getMarketInfos(
    "0xEC53c830f4444a8A56455c6836b5D2aA794289Aa",
    BigInt(blockNumber)
  );
  address = address?.toLowerCase();

  const marketsToUnderlying: any = {};
  for (let marketInfo of marketInfos) {
    marketsToUnderlying[marketInfo.address] = marketInfo.underlyingAddress;
  }

  let accountWhereQuery = address ? `account: "${address}" \n` : "";
  let amountWhereQuery = orWhere("supplied_gt: 0", "borrowed_gt: 0");

  let skip = 0;
  let fetchNext = true;

  const pageSize = 1000;
  const url = SUBGRAPH_URLS[chainId][protocol].url;

  let states: AccountState[] = [];

  while (fetchNext) {
    let query = `
    query TVLQuery {
      accountStates(
        block: {number: ${blockNumber}}
        where: {
          ${andWhere(accountWhereQuery, amountWhereQuery)}
        }
        orderBy: id
        first: ${pageSize}
        skip: ${skip}
      ) {
        id
        account
        token 
        supplied
        borrowed
      }
    }
    `;
    console.log(`Fetching ${skip} - ${skip + pageSize} / unknown`);

    let response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ query }),
      headers: { "Content-Type": "application/json" },
    });
    let data = await response.json();

    // Filter and map the account states
    const filteredAccountStates = data.data.accountStates
      .filter(
        (m: any) =>
          m.account !== zeroAddress && m.account.toLowerCase() !== deadAddress
      )
      .map((m: any) => ({
        id: m.id.toLowerCase(),
        account: m.account.toLowerCase(),
        token:
          marketsToUnderlying[
            m.token === zeroAddress
              ? WETH_ADDRESS[CHAINS.SCROLL].toLowerCase()
              : m.token
          ].toLowerCase(),
        lentAmount: m.supplied,
        borrowAmount: m.borrowed,
      }));

    // Push the filtered and mapped states into the states array
    states.push(...filteredAccountStates);

    if (data.data.accountStates.length == 0) {
      fetchNext = false;
    } else {
      skip += pageSize;
    }
  }

  states = states
    .map((state: AccountState) => {
      const marketInfo = marketInfos.find(
        (mi) => mi.underlyingAddress == state.token.toLowerCase()
      );
      if (!marketInfo) {
        console.log(`${state.token} not found`);
        return undefined;
      }

      return {
        ...state,
        lentAmount: Number(
          formatUnits(
            ((BigInt(state.lentAmount) || 0n) * marketInfo.exchangeRateStored) /
              10n ** 18n,
            marketInfo.underlyingDecimals
          )
        )
      };
    })
    .filter((x) => x !== undefined) as AccountState[];

  return states;
};

export const getTimestampAtBlock = async (blockNumber: number) => {
  const publicClient = createPublicClient({
    chain: extractChain({ chains: [scroll], id: CHAINS.SCROLL }),
    transport: http(RPC_URLS[CHAINS.SCROLL]),
  });

  const block = await publicClient.getBlock({
    blockNumber: BigInt(blockNumber),
  });
  return Number(block.timestamp * 1000n);
};

const andWhere = (...queries: string[]) => {
  return `and: [
    ${queries.map((q) => `{ ${q} }`).join("\n")}
  ]`;
};
const orWhere = (...queries: string[]) => {
  return `or: [
  ${queries.map((q) => `{ ${q} }`).join("\n")}
]`;
};
