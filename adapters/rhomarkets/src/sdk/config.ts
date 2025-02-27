export const enum CHAINS {
  SCROLL = 534352,
}

export const enum PROTOCOLS {
  RHO_MARKETS = 1,
}

export const SUBGRAPH_URLS = {
  [CHAINS.SCROLL]: {
    [PROTOCOLS.RHO_MARKETS]: {
      url: "https://openblock-adpater-service-production.up.railway.app/graph/query",
    },
  },
};

export const RPC_URLS = {
  [CHAINS.SCROLL]:
    "https://scroll-mainnet.blastapi.io/56ba9724-da20-4b84-b8af-69beda635aa6",
};

export const WETH_ADDRESS = {
  [CHAINS.SCROLL]: "0x5300000000000000000000000000000000000004",
};

export const rUSDC_ADDRESS = "0xAE1846110F72f2DaaBC75B7cEEe96558289EDfc5";

export const FIXED_BLOCK_NUMS = [9664314n, 10135815n];

export const FIXED_EXCHANGE_RATE = 1020933877280826510n;
