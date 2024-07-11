
export const QueryAllUsers = `
query QueryAllUsers($skip: Int, $block: Int) {
  users(first: 1000, skip: $skip, block: {number: $block}) {
    tradePrincipal
    tradeCountGainRate
    totalVolume
    totalTrade
    tinderCloseCount
    profitAmount
    openPrincipal
    openPositionCount
    openPosition
    openCount
    liquidationCount
    liquidationAmount
    limitCount
    id
    gainTradeCount
    deposited
    withdrawed
    closeCount
    amountGainRate
  }
}
`

export const QueryOpenTrades = `
     query QueryOpenTrades($start: Int, $end: Int, $skip: Int) {
      openTrades(
            skip: $skip,
            first: 1000,
            where: { status: 0, tradeType: 0, openTime_gt: $start, openTime_lte: $end },
            orderBy: openTime,
            orderDirection: desc
      ) {
        rolloverFee
        openTime
        pairIndex
        openFee
        long
        leverage
        id
        fundingFee
        trader
        leftMargin
      }
      }
`

export const QueryClosedTrades = `
     query fetchTradingHistory($skip: Int = 0, $start: Int, $end: Int) {    
         closeHistories(
                where: {closeTime_gt: $start, closeTime_lte: $end},
                orderBy: closeTime
                orderDirection: desc
                skip: $skip
                first: 1000
          ) {
            closeFee
            closeMargin
            closePrice
            closeTime
            fundingFee
            id
            leverage
            long
            openPrice
            orderId
            pairIndex
            profit
            rolloverFee
            user {
               id
            }
          }
 }
`
