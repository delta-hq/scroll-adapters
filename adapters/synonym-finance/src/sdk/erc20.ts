import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc.scroll.io/");
const abi = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

export class ERC20Info {
  decimals: number;
  symbol: string;

  constructor(decimals: number, symbol: string) {
    this.decimals = decimals;
    this.symbol = symbol;
  }

  weiToNumber(wei: bigint):number {
    return parseFloat(ethers.formatUnits(wei, this.decimals));
  }
}

const cache: {[address: string]: ERC20Info} = {};

export const getTokenInfo = async (token: string): Promise<ERC20Info> => {
  if (!cache[token]) {
    const contract = new ethers.Contract(token, abi, provider);
    const decimals = await contract.decimals();
    const symbol = await contract.symbol();
    cache[token] = new ERC20Info(Number(decimals), symbol);
  }
  return cache[token];
}
