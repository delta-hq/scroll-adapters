import { zeroAddress } from "viem";
import { CHAINS, PROTOCOLS, SUBGRAPH_URLS } from "./config";

interface ProtocalData {
  timestamp: number;
  block_number: number;
  user_address: string;
  market: string;
  supply_token: number;
  borrow_token: number;
}

interface GraphQLResponse {
  data: {
    data: ProtocalData[];
  };
  errors?: any[];
}

// Helper function to fetch data from Subgraph
export async function fetchSubgraphData(
  limit: number,
  lastId: string,
  url: string
) {
  const query = `
      query MyQuery {
        accounts(first: ${limit}, where: { id_gt: "${lastId}" }, orderBy: id) {
          id
          tokens {
            cTokenBalance
            storedBorrowBalance
            totalUnderlyingBorrowed
            totalUnderlyingSupplied
            accrualBlockNumber
            market {
              id
              underlyingAddress
              symbol
              underlyingSymbol
              blockTimestamp
              underlyingDecimals
            }
          }
        }
      }
    `;

  let response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ query }),
    headers: { "Content-Type": "application/json" },
  });

  const { data } = await response.json();

  return {
    accounts: data?.accounts || [],
    lastId: data?.accounts[data?.accounts.length - 1].id || "",
  };
}

export async function fetchGraphQLData(
  blockNumber: number,
  chainId: CHAINS,
  protocol: PROTOCOLS
): Promise<ProtocalData[]> {
  const url = SUBGRAPH_URLS[chainId][protocol].url;
  const limit = Infinity;
  const offset = 0;

  const totalLimit = 1000; // Adjust total fetch limit if needed
  let fetchOffset = 0;
  let allData: any[] = [];
  let moreDataAvailable = true;
  let lastId = "";

  let count = 0;

  while (moreDataAvailable) {
    const { accounts: batchData, lastId: currentLastId } =
      await fetchSubgraphData(totalLimit, lastId, url);

    lastId = currentLastId;
    allData = allData.concat(batchData);

    count++;

    if (batchData.length < totalLimit) {
      moreDataAvailable = false;
    } else {
      fetchOffset += totalLimit;
    }
  }

  // Check if data is returned
  if (allData) {
    // Process and transform the data
    const flatData = allData
      .flatMap((account) =>
        account.tokens.map(
          (token: {
            underlyingDecimals: any;
            market: { blockTimestamp: any; id: any };
            accrualBlockNumber: any;
            cTokenBalance: any;
            storedBorrowBalance: any;
          }) => ({
            timestamp: Number(token.market.blockTimestamp),
            block_number: token.accrualBlockNumber,
            user_address: account.id,
            market: token.market.id,
            supply_token: Number(token.cTokenBalance),
            borrow_token: Number(token.storedBorrowBalance),
          })
        )
      )
      .sort((a, b) => b.block_number - a.block_number);

    if (!offset && !limit) {
      return flatData; // Return all data
    } else {
      return flatData.slice(offset, offset + limit); // Apply pagination
    }
  } else {
    return [];
  }
}
