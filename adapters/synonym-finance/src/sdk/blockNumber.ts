import { ethers } from "ethers";

const scrollProvider = new ethers.JsonRpcProvider("https://rpc.scroll.io/");
const arbProvider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

interface Block {
  number: number;
  timestamp: number;
}

interface Bounds {
  lower: Block;
  upper: Block;
}

export const SCROLL_SPOKE_DEPLOYMENT_BLOCK = 6063018;

const tsCache: Block[] = [];


export const getBlockSearchBoundsForTs = async (targetTime: number): Promise<Bounds> => {
  if (tsCache.length < 3) {
    tsCache.push({
      number: SCROLL_SPOKE_DEPLOYMENT_BLOCK,
      timestamp: (await arbProvider.getBlock(SCROLL_SPOKE_DEPLOYMENT_BLOCK))!.timestamp
    });
    const currentBlock = await arbProvider.getBlockNumber();
    tsCache.push({
      number: currentBlock,
      timestamp: (await arbProvider.getBlock(currentBlock))!.timestamp,
    });
    return {
      lower: tsCache[0],
      upper: tsCache[1]
    }
  } else {
    let lowerBoundIdx = 0;
    let upperBoundIdx = tsCache.length;
    for (;;) {
      let mid = Math.round((lowerBoundIdx+upperBoundIdx) / 2);
      if (tsCache[mid].timestamp == targetTime) {
        return {
          lower: tsCache[mid],
          upper: tsCache[mid]
        };
      } else if (tsCache[mid].timestamp < targetTime) {
        lowerBoundIdx = mid;
      } else {
        upperBoundIdx = mid;
      }
      if (upperBoundIdx - lowerBoundIdx <= 1) {
        return {
          lower: tsCache[lowerBoundIdx],
          upper: tsCache[upperBoundIdx]
        }
      }
    }
  }
}

export const scrollBlockToArbBlock = async (scrollBlock: number): Promise<number> => {
  if (tsCache.length) {
    tsCache.sort((a, b) => a.timestamp - b.timestamp);
  }

  const scrollBlockInfo = await scrollProvider.getBlock(scrollBlock);
  const targetTime = scrollBlockInfo!.timestamp;
  const bounds = await getBlockSearchBoundsForTs(targetTime);
  for (;;) {
    const mid = Math.round((bounds.upper.number + bounds.lower.number) / 2);
    const midBlock = (await arbProvider.getBlock(mid))!;
    tsCache.push({number: midBlock.number, timestamp: midBlock.timestamp});
    if (midBlock.timestamp == targetTime) {
      return midBlock.number;
    } else if (targetTime > midBlock.timestamp) {
      bounds.lower = midBlock;
    } else {
      bounds.upper = midBlock;
    }

    if (bounds.upper.number - bounds.lower.number <= 1) {
      break;
    }
  }
  return bounds.upper.number;
}