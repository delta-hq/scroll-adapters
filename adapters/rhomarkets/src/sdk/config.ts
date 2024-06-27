export const enum CHAINS {
  SCROLL = 534352,
}

export const enum PROTOCOLS {
  RHO_MARKETS = 1,
}

export const SUBGRAPH_URLS = {
  [CHAINS.SCROLL]: {
    [PROTOCOLS.RHO_MARKETS]: {
      url: "https://api.studio.thegraph.com/query/79909/rho-scroll-staging/version/latest",
    },
  },
};

export const RPC_URLS = {
  [CHAINS.SCROLL]:
    "https://scroll-mainnet.blastapi.io/cf50a7c9-e512-45ac-ae1d-d319f1a34f06",
};

export const WETH_ADDRESS = {
  [CHAINS.SCROLL]: "0x5300000000000000000000000000000000000004",
};
