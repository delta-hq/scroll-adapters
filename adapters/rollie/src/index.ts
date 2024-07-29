import PairInfoABI from "./abi/PairInfo";
import {scroll} from "viem/chains";
import {createPublicClient, http, formatUnits, Abi, Address, fallback} from "viem";
import {chunk} from "lodash";
import {QueryAllUsers, QueryClosedTrades, QueryOpenTrades} from "./queries";
import * as fs from "fs";
import csv from "csv-parser";
import { format } from 'fast-csv';
import { write } from 'fast-csv';
import { pipeline as streamPipeline } from 'stream';
import * as converter from "json-2-csv";


import TradingVaultABI from "./abi/TradingVault";
import {resolve} from "path";
import Erc20Abi from "./abi/Erc20";
const PairInfoAddress = "0xA852CE8B0BF3Bcd9191D6140a4627E7823c84848";
const TradingVaultAddress = "0xA79E00e68549e91e5f0c27048F453b3D87ef6E3D";
const USDCAddress = "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4";
const SubgrapnUrl = "https://api.studio.thegraph.com/query/76203/rollie-finance/0.0.2";
const RPCs = [
    "https://scroll.drpc.org",
    "https://scroll.blockpi.network/v1/rpc/public",
    "https://scroll-mainnet.chainstacklabs.com",

];
const USDC_DECIMALS = 6;
const RLP_DECIMALS = 6;
const PPS_DECIMALS = 18;
const LEVERAGE_DECIMALS = 18;
const BLOCK_TIME = 3000;
const FEE_DECIMALS = 10;




const blockCountPerHour = 3600 * 1000 / BLOCK_TIME;

interface BlockData {
    blockNumber: number;
    blockTimestamp: number;
}

const readBlocksFromCSV = async (filePath: string): Promise<BlockData[]> => {
    const blocks: BlockData[] = [];

    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv({ separator: ',' })) // Specify the separator as '\t' for TSV files
            .on('data', (row) => {
                console.log(row, 'row')
                const blockNumber = parseInt(row.number, 10);
                const blockTimestamp = parseInt(row.timestamp, 10);
                if (!isNaN(blockNumber) && blockTimestamp) {
                    blocks.push({ blockNumber: blockNumber, blockTimestamp });
                }
            })
            .on('end', () => {
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            });
    });

    return blocks;
};


const client = createPublicClient({
    chain: {
        ...scroll,
        contracts: {
            multicall3: {
                address: "0xcA11bde05977b3631167028862bE2a173976CA11"
            }
        }
    },
    transport: fallback(RPCs.map((rpc) => http(rpc))),
    batch: {
        multicall: true,
    }
})

const PairInfoContract = {
    abi: PairInfoABI as any,
    address: PairInfoAddress as Address,
}

const TradingVaultContract = {
    abi: TradingVaultABI as any,
    address: TradingVaultAddress as Address,
}

const USDCContract = {
    abi: Erc20Abi as any,
    address: USDCAddress as Address,
}

interface Pair {
    funding_rate: {
        long: string,
        short: string,
    },
    asset: string,
}

async function getPairs(block: BlockData): Promise<Pair[]> {
    console.log("Start load pairs ...")
    return await client.readContract({
        ...PairInfoContract,
        functionName: "pairsCount",
        args: [],
        blockNumber: BigInt(block.blockNumber)
    }).then((pairCount: any) => {
        const calls = [];
        for (let i = 0; i < parseInt(pairCount.toString()); i++) {
            calls.push({
                ...PairInfoContract,
                functionName: "pairs",
                args: [i],
            });
            calls.push({
                ...PairInfoContract,
                functionName: "openInterests",
                args: [i],
            })
            calls.push({
                ...PairInfoContract,
                functionName: "pairParams",
                args: [i],
            })
        }
        return client.multicall({
            contracts: calls,
            allowFailure: false,
            blockNumber: BigInt(block.blockNumber)
        }).then((results) => {
            const pairInfos = chunk(results, 3);
            console.log("Finish load pairs ...")
            return pairInfos.map((pairInfo, index) => {
                const info = pairInfo[0] as any;
                const interests = pairInfo[1] as any;
                const params = pairInfo[2] as any;

                const longOI = interests[0] as bigint;
                const shortOI = interests[1] as bigint;
                const fundingFeePerBlockPercent = params[3];

                const longFundingFeePerHour = longOI === 0n
                    ? "0"
                    : formatUnits(
                        (longOI - shortOI) * fundingFeePerBlockPercent * BigInt(blockCountPerHour) / longOI * 100n,
                        FEE_DECIMALS,
                    )

                const shortFundingFeePerHour = shortOI === 0n
                    ? "0"
                    : formatUnits(
                        (shortOI - longOI) * fundingFeePerBlockPercent * BigInt(blockCountPerHour) / shortOI * 100n,
                        FEE_DECIMALS,
                    )
                return {
                    funding_rate: {
                        long: longFundingFeePerHour,
                        short: shortFundingFeePerHour,
                    },
                    asset: info[0] as string
                }
            })
        })
    })
}

interface User {
    tradePrincipal: string
    tradeCountGainRate: string
    totalVolume: string
    totalTrade: string
    tinderCloseCount: string
    profitAmount: string
    openPrincipal: string
    openPositionCount: string
    openPosition: string
    openCount: string
    liquidationCount: string
    liquidationAmount: string
    limitCount: string
    id: string
    gainTradeCount: string
    deposited: string
    withdrawed: string
    closeCount: string
    amountGainRate: string
    staked: string,
    user_balance_usdc: string,
}

async function getAllUser(lastRequest: User[], page: number = 0, block: BlockData): Promise<User[]> {
    console.log("Start load users ...");
    const res = await fetch(SubgrapnUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: QueryAllUsers,
            variables: {
                skip: page * 1000,
                block: block.blockNumber
            }
        })
    })
    const data = await res.json();
    const users = data.data.users || [];

    if (users.length < 1000) {
        const allUsers = [...lastRequest, ...users]
        console.log("Finish load users ...");
        // get all staked value
        const calls: any[] = [];
        allUsers.forEach((item: User) => {
            calls.push({
                ...TradingVaultContract,
                functionName: "balanceOf",
                args: [item.id],
            })
            calls.push({
                ...USDCContract,
                functionName: "balanceOf",
                args: [item.id],
            })
        })
        calls.push({
            ...TradingVaultContract,
            functionName: "getPricePerFullShare",
            args: [],
        })
        console.log("Start load user tvls ...");
        const result = await client.multicall({
            contracts: calls,
            allowFailure: false,
            blockNumber: BigInt(block.blockNumber)
        }) as unknown as bigint[];
        console.log("Finish load user tvls ...");
        const pps = result[result.length - 1];
        return allUsers.map((item, index) => {
            const staked = formatUnits(
                (result[index * 2] * pps ) / (10n ** BigInt(PPS_DECIMALS)),
                RLP_DECIMALS
            );
            const user_balance_usdc = formatUnits(
                (result[index * 2 + 1]) ,
                USDC_DECIMALS
            )
            return {
                ...item,
                staked,
                user_balance_usdc
            }
        });
    }
    return await getAllUser([...lastRequest, ...users], page + 1, block);
}

interface OpenOrder {
    rolloverFee: string;
    openTime: string;
    pairIndex: string;
    openFee: string;
    long: boolean;
    leverage: string;
    id: string;
    fundingFee: string;
    trader: string;
    leftMargin: string;
}

interface ClosedOrder {
    closeFee: string;
    closeMargin: string;
    closePrice: string;
    closeTime: string;
    fundingFee: string;
    id: string;
    leverage: string;
    long: boolean;
    openPrice: string;
    orderId: string;
    pairIndex: string;
    profit: string;
    rolloverFee: string;
    user: {
        id: string;
    }
}

interface Result {
    protocol: string;
    block_number: string;
    timestamp: string;
    user_address: string;
    market: string;
    trade_pair_symbol: string;
    daily_user_volume_usd: number;
    funding_rate: string;
    supplied_amount_usd: number;
    open_shorts_usd: number;
    open_longs_usd: number;
    protocol_fees_usd: number;
    users_fees_usd: number;
    etl_timestamp: number;
    user_balance_usdc: string;
}

// const endTime = Math.ceil(Date.now() / 1000);
// const startTime = endTime - 24 * 3600;

async function getLast24HOpenTrades(lastRequest: OpenOrder[], page: number = 0, block: BlockData): Promise<OpenOrder[]> {
    const endTime = block.blockTimestamp;
    const startTime = endTime - 24 * 3600;
    console.log("Start load open trades ...")
    const res = await fetch(SubgrapnUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: QueryOpenTrades,
            variables: {
                skip: page * 1000,
                start: startTime,
                end: endTime,
            }
        })
    })
    const data = await res.json();
    const openTrades = data.data.openTrades || [];

    if (openTrades.length < 1000) {
        console.log("Finish load open trades ...")
        return [...lastRequest, ...openTrades];
    }
    return await getLast24HOpenTrades([...lastRequest, ...openTrades], page + 1, block);
}

async function getLast24HClosedTrades(lastRequest: ClosedOrder[], page: number = 0, block: BlockData): Promise<ClosedOrder[]> {
    const endTime = block.blockTimestamp;
    const startTime = endTime - 24 * 3600;
    console.log("Start load closed trades ...")
    const res = await fetch(SubgrapnUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: QueryClosedTrades,
            variables: {
                skip: page * 1000,
                start: startTime,
                end: endTime,
            }
        })
    })
    const data = await res.json();
    const closedOrders = data.data.closeHistories || [];

    if (closedOrders.length < 1000) {
        console.log("Finish load closed trades ...")
        return [...lastRequest, ...closedOrders];
    }
    return await getLast24HClosedTrades([...lastRequest, ...closedOrders], page + 1, block);

}

const runDate = Date.now();

function generateSinglePairData(openOrders: OpenOrder[], closedOrders: ClosedOrder[]) {
    let open_shorts = 0n;
    let open_longs = 0n;
    let protocol_fees = 0n;
    let users_fees = 0n;
    openOrders.forEach((order) => {
        if (order.long) {
            open_longs += BigInt(order.leftMargin) * BigInt(order.leverage);
        } else {
            open_shorts += BigInt(order.leftMargin) * BigInt(order.leverage);
        }
        protocol_fees += BigInt(order.openFee) * 300n / 1000n;
        users_fees += BigInt(order.openFee) * 350n / 1000n;
    })

    closedOrders.forEach((order) => {
        if (order.long) {
            open_longs += BigInt(order.closeMargin) * BigInt(order.leverage);
        } else {
            open_shorts += BigInt(order.closeMargin) * BigInt(order.leverage);
        }
        protocol_fees += BigInt(order.closeFee) * 300n / 1000n;
        users_fees += BigInt(order.closeFee) * 350n / 1000n + BigInt(order.rolloverFee) - BigInt(order.fundingFee);
    })
    return {
        open_shorts: Number(formatUnits(open_shorts, USDC_DECIMALS + LEVERAGE_DECIMALS)),
        open_longs: Number(formatUnits(open_longs, USDC_DECIMALS + LEVERAGE_DECIMALS)),
        protocol_fees: Number(formatUnits(protocol_fees, USDC_DECIMALS)),
        users_fees: Number(formatUnits(users_fees, USDC_DECIMALS)),
        volumes: Number(formatUnits(open_shorts + open_longs, USDC_DECIMALS + LEVERAGE_DECIMALS)),
    }
}

function generateUserData(user: User, openOrders: OpenOrder[], closedOrders: ClosedOrder[], pairs: Pair[], block: BlockData): Result[] {
    const protocol = "rollie";
    const date = runDate;
    const market = PairInfoAddress;
    const trader_address = user.id;
    return pairs.map((pair, index) => {
        const pairData = generateSinglePairData(
            openOrders.filter((order) => Number(order.pairIndex) === index),
            closedOrders.filter((order) => Number(order.pairIndex) === index),
        )
        return {
            protocol,
            etl_timestamp:date,
            market,
            trade_pair_symbol: pair.asset,
            block_number: block.blockNumber.toString(10),
            timestamp: block.blockTimestamp.toString(10),
            user_address: trader_address,
            daily_user_volume_usd: pairData.volumes,
            funding_rate: JSON.stringify({
                long: pair.funding_rate.long,
                short: pair.funding_rate.short,
            }),
            supplied_amount_usd: Number(user.staked),
            open_shorts_usd: pairData.open_shorts,
            open_longs_usd: pairData.open_longs,
            protocol_fees_usd: pairData.protocol_fees,
            users_fees_usd: pairData.users_fees,
            user_balance_usdc: user.user_balance_usdc,
        }
    })
}

async function getAllData(block: BlockData) {
    return Promise.all([
        getPairs(block),
        getAllUser([], undefined, block),
        getLast24HOpenTrades([],undefined, block),
        getLast24HClosedTrades([], undefined, block)
    ]).then(([pairs, users, openTrades, closedTrades]) => {
        const openOrderMap = openTrades.reduce((acc, cur) => {
            const orders = acc[cur.trader] || [];
            return {
                ...acc,
                [cur.trader]: [...orders, cur]
            }
        }, {} as {
            [user: string]: OpenOrder[],
        })
        const closedOrderMap = closedTrades.reduce((acc, cur) => {
            const order = acc[cur.user.id] || [];
            return {
                ...acc,
                [cur.user.id]: [...order, cur]
            }
        }, {} as {
            [user: string]: ClosedOrder[],
        })
        const result = users.reduce((acc, user) => {
            const openOrders = openOrderMap[user.id] || [];
            const closedOrders = closedOrderMap[user.id] || [];
            const userData = generateUserData(user, openOrders, closedOrders, pairs, block);
            return [
                ...acc,
                ...userData,
            ]
        }, [] as Result[]);
        // console.log("Start Write file ...");
        return result;
        // fs.writeFile("./output/result.json", JSON.stringify(result), (err) => {
        //     if (!err) {
        //         console.log("Write file success, check result in ./output/result.json");
        //     } else {
        //         console.log("Write Error!", err);
        //     }
        // });
    });
}


function main() {
    readBlocksFromCSV(resolve("./") + "/hourly_blocks.csv").then(async (blocks) => {
        let results: Result[] = [];
        for (const block of blocks) {
            try {
                const blockRes = await getAllData(block);
                results = results.concat(blockRes);
            } catch (error) {
                console.error(`An error occurred for block ${block}:`, error);
            }
        }
        console.log("Start Write file ...");
        const csv = converter.json2csv(results);
        const ws = fs.createWriteStream("outputData.csv");
        ws.on("finish", () => {
            console.log("Write file success, check result in outputData.csv");
        });
        ws.on("error", (err) => {
            console.log("Write Error!", err);
        });
        ws.write(csv);
        ws.end();
        // const ws = fs.createWriteStream(`outputData.csv`, {  });
        //
        // if (i % batchSize === 0 || i === blocks.length) {
        //     write(results, { headers: i === batchSize })
        //         .pipe(ws)
        //         .on("finish", () => {
        //             console.log(`CSV file has been written.`);
        //         });
        //
        //     // Clear the accumulated CSV rows
        //     results.length = 0;
        // }
        // i += 1;
    });
}

main();
