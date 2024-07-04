const PairInfoABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "int256",
                "name": "valueLong",
                "type": "int256"
            },
            {
                "indexed": false,
                "internalType": "int256",
                "name": "valueShort",
                "type": "int256"
            }
        ],
        "name": "AccFundingFeesStored",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "AccRolloverFeesStored",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            }
        ],
        "name": "FeeAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "FeeUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            }
        ],
        "name": "GroupAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "GroupUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "version",
                "type": "uint8"
            }
        ],
        "name": "Initialized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferStarted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "pairName",
                "type": "string"
            }
        ],
        "name": "PairAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "onePercentDepthAbove",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "onePercentDepthBelow",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "rolloverFeePerBlockP",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "fundingFeePerBlockP",
                        "type": "uint256"
                    }
                ],
                "indexed": false,
                "internalType": "struct PairInfos.PairParams",
                "name": "value",
                "type": "tuple"
            }
        ],
        "name": "PairParamsUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "PairUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "maxOI",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxNetOI",
                        "type": "uint256"
                    }
                ],
                "indexed": false,
                "internalType": "struct PairInfos.InterestLimt",
                "name": "_limit",
                "type": "tuple"
            }
        ],
        "name": "SetInterestLimt",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "_keeper",
                "type": "address"
            }
        ],
        "name": "SetKeeper",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "contract ITradingStorage",
                "name": "_tradingStorage",
                "type": "address"
            }
        ],
        "name": "SetStorage",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "openFeeP",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "closeFeeP",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct PairInfos.Fee",
                "name": "_fee",
                "type": "tuple"
            }
        ],
        "name": "addFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "guaranteedSlEnable",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxCollateralP",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct PairInfos.Group",
                "name": "_group",
                "type": "tuple"
            }
        ],
        "name": "addGroup",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "pairName",
                        "type": "string"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "feedId",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "spreadP",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "feeIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "groupIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxSpread",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minLeverage",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxLeverage",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minMagin",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minLevPos",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxLevPos",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "priceRollover",
                        "type": "bool"
                    }
                ],
                "internalType": "struct PairInfos.Pair[]",
                "name": "_pairs",
                "type": "tuple[]"
            }
        ],
        "name": "addPairs",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            }
        ],
        "name": "delTradeInitialAccFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "fees",
        "outputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "openFeeP",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "closeFeeP",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "feesCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "position",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "long",
                "type": "bool"
            }
        ],
        "name": "getFundingAndRolloverFee",
        "outputs": [
            {
                "internalType": "int256",
                "name": "fundingFee",
                "type": "int256"
            },
            {
                "internalType": "uint256",
                "name": "rolloverFee",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            }
        ],
        "name": "getPendingAccFundingFees",
        "outputs": [
            {
                "internalType": "int256",
                "name": "valueLong",
                "type": "int256"
            },
            {
                "internalType": "int256",
                "name": "valueShort",
                "type": "int256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            }
        ],
        "name": "getPendingAccRolloverFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "openPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "collateral",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "leverage",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "long",
                "type": "bool"
            }
        ],
        "name": "getTradeLiquidationPrice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "openPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "long",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "tradeOpenInterest",
                "type": "uint256"
            }
        ],
        "name": "getTradePriceImpact",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "priceAfterImpact",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "groups",
        "outputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "guaranteedSlEnable",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "maxCollateralP",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "groupsCollaterals",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "long",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "short",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "groupsCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_pairIndex",
                "type": "uint256"
            }
        ],
        "name": "guaranteedSlEnable",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ITradingStorage",
                "name": "_tradingStorage",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_keeper",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "interestLimts",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "maxOI",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "maxNetOI",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "collateral",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "long",
                "type": "bool"
            }
        ],
        "name": "isExceedGroupsCollateralLimit",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "position",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isLong",
                "type": "bool"
            }
        ],
        "name": "isInPairInterestLimit",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "isPairListed",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "keeper",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "margin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "leverage",
                "type": "uint256"
            }
        ],
        "name": "legalPositionSizeAndLeverage",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "occupiedCollateral",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "openInterests",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "long",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "short",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_pairIndex",
                "type": "uint256"
            }
        ],
        "name": "pairCloseFeeP",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_pairIndex",
                "type": "uint256"
            }
        ],
        "name": "pairFeedId",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "pairFundingFees",
        "outputs": [
            {
                "internalType": "int256",
                "name": "accPerOiLong",
                "type": "int256"
            },
            {
                "internalType": "int256",
                "name": "accPerOiShort",
                "type": "int256"
            },
            {
                "internalType": "uint256",
                "name": "lastUpdateBlock",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_pairIndex",
                "type": "uint256"
            }
        ],
        "name": "pairOpenFeeP",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "pairParams",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "onePercentDepthAbove",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "onePercentDepthBelow",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "rolloverFeePerBlockP",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "fundingFeePerBlockP",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "pairRolloverFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "accPerCollateral",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lastUpdateBlock",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_pairIndex",
                "type": "uint256"
            }
        ],
        "name": "pairSpreadP",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "pairs",
        "outputs": [
            {
                "internalType": "string",
                "name": "pairName",
                "type": "string"
            },
            {
                "internalType": "bytes32",
                "name": "feedId",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "spreadP",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "feeIndex",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "groupIndex",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "maxSpread",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minLeverage",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "maxLeverage",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minMagin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minLevPos",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "maxLevPos",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "priceRollover",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pairsCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pendingOwner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_pairIndex",
                "type": "uint256"
            }
        ],
        "name": "priceRollover",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "refreshTrading",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "maxOI",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxNetOI",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct PairInfos.InterestLimt",
                "name": "_limit",
                "type": "tuple"
            }
        ],
        "name": "setInterestLimt",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_keeper",
                "type": "address"
            }
        ],
        "name": "setKeeper",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "indices",
                "type": "uint256[]"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "onePercentDepthAbove",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "onePercentDepthBelow",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "rolloverFeePerBlockP",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "fundingFeePerBlockP",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct PairInfos.PairParams[]",
                "name": "values",
                "type": "tuple[]"
            }
        ],
        "name": "setPairParams",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ITradingStorage",
                "name": "_tradingStorage",
                "type": "address"
            }
        ],
        "name": "setStorage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "long",
                "type": "bool"
            }
        ],
        "name": "storeTradeInitialAccFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "tradeInitialAccFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "rollover",
                "type": "uint256"
            },
            {
                "internalType": "int256",
                "name": "funding",
                "type": "int256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "trading",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "tradingStorage",
        "outputs": [
            {
                "internalType": "contract ITradingStorage",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "openFeeP",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "closeFeeP",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct PairInfos.Fee",
                "name": "_fee",
                "type": "tuple"
            }
        ],
        "name": "updateFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "guaranteedSlEnable",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxCollateralP",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct PairInfos.Group",
                "name": "_group",
                "type": "tuple"
            }
        ],
        "name": "updateGroup",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_pairIndex",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_collateral",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "_long",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "_increase",
                "type": "bool"
            }
        ],
        "name": "updateGroupCollateral",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_pairIndex",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "_long",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "_increase",
                "type": "bool"
            }
        ],
        "name": "updateOpenInterest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_pairIndex",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "pairName",
                        "type": "string"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "feedId",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "spreadP",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "feeIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "groupIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxSpread",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minLeverage",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxLeverage",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minMagin",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minLevPos",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxLevPos",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "priceRollover",
                        "type": "bool"
                    }
                ],
                "internalType": "struct PairInfos.Pair",
                "name": "_pair",
                "type": "tuple"
            }
        ],
        "name": "updatePair",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pairIndex",
                "type": "uint256"
            },
            {
                "internalType": "enum TradeType",
                "name": "tradeType",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "limit",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "current",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isLong",
                "type": "bool"
            }
        ],
        "name": "withinMaxSpread",
        "outputs": [
            {
                "internalType": "bool",
                "name": "result",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
;


export default PairInfoABI;
