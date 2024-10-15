import { scrollBlockToArbBlock } from "./blockNumber";

const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/64207/synonym-finance/version/latest";
const SCROLL_WORMHOLE_CHAIN_ID = 34;

export interface WrappedAsset {
  id: string;
  originAssetAddress: string;
  depositInterestAccrualIndex: string;
  borrowInterestAccrualIndex: string;
}

export interface VaultAmount {
  asset: WrappedAsset;
  deposited: string;
  borrowed: string;
  depositInterestAccrualIndex: string;
  borrowInterestAccrualIndex: string;
}

export interface Vault {
  id: string;
  amounts: VaultAmount[];
}

export interface VaultsAndAssets {
  vaults: Vault[];
  assets: WrappedAsset[];
}

const getWrappedAssetsQuery = (block: number) => `
{
  wrappedAssets(
    where: {originWormholeChainId: ${SCROLL_WORMHOLE_CHAIN_ID}}
    block: {number: ${block}}
    first: 1000
  ) {
    id
  }
}
`;

const getVaultsQuery = (
  block: number,
  assets: string[],
  fromId: string = ""
) => `
{
  vaults(
    first: 1000
    where:{
      and: [
        {amounts_: {
          asset_in:${JSON.stringify(assets)}
        }},
        {
          or: [
            {amounts_: {deposited_gt: 0}},
            {amounts_: {borrowed_gt: 0}},
          ]
        },
        { id_gt: "${fromId}" }
      ]
    }
    block: {number: ${block}}
  ) {
    id
    amounts {
      asset {
        id,
        originAssetAddress
        depositInterestAccrualIndex
        borrowInterestAccrualIndex
      }
      deposited
      borrowed
      depositInterestAccrualIndex
      borrowInterestAccrualIndex
    }
  }
}
`;

const getSubgraphResult = async (query: string): Promise<any> => {
  const response = await fetch(SUBGRAPH_URL, {
    method: "POST",
    body: JSON.stringify({ query }),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  try {
    return (await response.json()).data;
  } catch (err) {
    console.error(`Error parsing JSON response: ${await response.text()}`);
  }
  return
}

const getWrappedAssetsAtBlock = async (block: number): Promise<WrappedAsset[]> => {
  return (await getSubgraphResult(getWrappedAssetsQuery(block))).wrappedAssets;
}

export const getVaultsAndAssetsAtScrollBlock = async (scrollBlock: number): Promise<VaultsAndAssets> => {
  const arbBlock = await scrollBlockToArbBlock(scrollBlock);
  const assets = await getWrappedAssetsAtBlock(arbBlock);
  let vaults: Vault[] = [];
  for (;;) {
    const query = getVaultsQuery(
      arbBlock,
      assets.map((x: WrappedAsset) => x.id),
      vaults.length > 0 ? vaults[vaults.length - 1].id : ""
    );
    const newVaults = (await getSubgraphResult(query)).vaults;

    if (newVaults.length > 0) {
      vaults = vaults.concat(newVaults);
    } else {
      return {vaults, assets};
    }
  }
}
