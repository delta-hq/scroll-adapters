export const enum CHAINS {
  SCROLL = 534352,
}

export const enum PROTOCOLS {
  LAYERBANK = 1,
}

export const SUBGRAPH_URLS = {
  [CHAINS.SCROLL]: {
    [PROTOCOLS.LAYERBANK]: {
      url: "https://api.goldsky.com/api/public/project_clwadadu5rddf01xa3m0m8ep0/subgraphs/layerbank_scroll/1.0.0/gn",
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
