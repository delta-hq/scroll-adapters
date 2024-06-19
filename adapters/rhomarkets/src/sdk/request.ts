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

const query = `
query ($limit: Int, $offset: Int, $blockNumber: Int) {
    data(first: $limit, skip: $offset, block: { number: $blockNumber }) {
      timestamp
      block_number
      user_address
      market
      supply_token
      borrow_token
    }
  }

`;

export async function fetchGraphQLData(
  blockNumber: number
): Promise<ProtocalData[]> {
  //   limit: number,
  //   offset: number,
  // data(block: { number: ${blockNumber} }) {
  const query = `
    query RHO_MARKETS {
      data {
          timestamp
          block_number
          user_address
          market
          supply_token
          borrow_token
        }
      }
    
    `;

  try {
    const response = await fetch(
      "https://drgstmbns1.execute-api.us-east-1.amazonaws.com/default/RhoMarketPoints",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }
    );

    const responseData: GraphQLResponse = await response.json();
    if (responseData.errors) {
      console.error("GraphQL errors:", responseData.errors);
      return [];
    }
    return responseData.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
