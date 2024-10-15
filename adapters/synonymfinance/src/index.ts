

import { getVaultsAndAssetsAtScrollBlock, Vault, WrappedAsset } from "./sdk/subgraph";
import { readBlocksFromCSV, BlockData, OutputDataSchemaRow, writeOutputToCSV } from "./sdk/csv";
import { getTokenInfo } from "./sdk/erc20";
import { SCROLL_SPOKE_DEPLOYMENT_BLOCK } from "./sdk/blockNumber";



export const mapVaultsToOutputRows = async (vaults: Vault[], assets: WrappedAsset[], block: BlockData): Promise<OutputDataSchemaRow[]> => {
  const scrollAssetIds = assets.map((a) => a.id);
  const now = Math.floor(Date.now() / 1000);
  let outputs: OutputDataSchemaRow[] = [];
  for (const vault of vaults) {
    for (const va of vault.amounts) {
      if (!scrollAssetIds.includes(va.asset.id)) {
        continue;
      }

      const tokenInfo = await getTokenInfo(va.asset.originAssetAddress);
      outputs.push({
        protocol: "SynonymFinance",
        timestamp: block.blockTimestamp,
        block_number: block.blockNumber,
        etl_timestamp: now,
        token_address: va.asset.originAssetAddress,
        underlying_decimals: tokenInfo.decimals,
        token_symbol: tokenInfo.symbol,
        user_address: vault.id.toLowerCase(),
        market: va.asset.originAssetAddress.toLowerCase(),
        supply_token: tokenInfo.weiToNumber(BigInt(va.deposited) * BigInt(va.asset.depositInterestAccrualIndex) / BigInt(va.depositInterestAccrualIndex)),
        borrow_token: tokenInfo.weiToNumber(BigInt(va.borrowed) * BigInt(va.asset.borrowInterestAccrualIndex) / BigInt(va.borrowInterestAccrualIndex)),
      });
    }
  }
  return outputs;
}

readBlocksFromCSV("hourly_blocks.csv")
  .then(async (blocks: BlockData[]) => {
    let data: OutputDataSchemaRow[] = [];
    for (const block of blocks) {
      if (block.blockNumber < SCROLL_SPOKE_DEPLOYMENT_BLOCK) {
        continue;
      }
      try {
        const {vaults, assets} = await getVaultsAndAssetsAtScrollBlock(block.blockNumber);
        const outputs = await mapVaultsToOutputRows(vaults, assets, block);
        data = data.concat(outputs);
      } catch (error) {
        console.error(`An error occurred for block ${block}:`, error);
      }
    }
    await writeOutputToCSV(`outputData.csv`, data);
  })
  .catch((err) => {
    console.error("Error reading CSV file:", err);
  });
