const calculate = require('../utils/calculate');
const indicators = require('./indicators.service');
const logsManager = require('../utils/logsManager');
const dataManager = require('../utils/dataManager');
const moment = require('moment');

const superTrendEMAStrategy = async (candles, params) => {
  let indicatorsToApply = [{functionName: "superTrend", params: [10, 3, 'supertrend']}, {functionName: "EMA", params: [200]}]
  candles = await dataManager.applyIndicators(candles, indicatorsToApply)
  let intervals = Object.keys(candles)
  const balance = initBalance(candles[intervals[0]],params)
  const initialPairBalance = balance.initialPairBalance
  let newPairBalance = balance.newPairBalance
  if(intervals.length > 1){
    if(!params.startTime){
      console.log("Please provide startTime")
      return "Please provide startTime"
    }
  }
  for(const interval of intervals) {
    let candlesForInterval = candles[interval]
    candlesForInterval.map((candle, index) => {
      const currentCandle = candle;
      const previousCandle = candlesForInterval[index - 1];
      if (previousCandle) {
        if (
          (currentCandle.supertrend === 1 &&
            previousCandle.supertrend !== currentCandle.supertrend &&
            currentCandle.close > currentCandle.ema) ||
          (currentCandle.supertrend === 1 && currentCandle.close > currentCandle.ema)
        ) {
          buy(initialPairBalance, newPairBalance, currentCandle)
        }

        if (
          (currentCandle.supertrend === 0 &&
            previousCandle.supertrend !== currentCandle.supertrend &&
            currentCandle.close < currentCandle.ema) ||
          (currentCandle.supertrend === 0 && currentCandle.close < currentCandle.ema)
        ) {
          sell(initialPairBalance, newPairBalance, currentCandle)
        }
      }
      if (index === candles[interval].length - 1) {
        sell(initialPairBalance, newPairBalance, currentCandle)
      }
    });
  }

  logsManager.showResults(initialPairBalance, newPairBalance)

  return newPairBalance;
};


const manageBackTestEntry = async(candles, params) => {
  let intervals = Object.keys(candles)
  let newCandlesByInterval = []
  intervals.map((interval) => {
    let newCandlesDataForInterval = []
    candles[interval].map((candle) => {
      if(!isNaN(candle.supertrend)){
        newCandlesDataForInterval.push(candle)
      }
    })
    newCandlesDataForInterval[interval] = newCandlesDataForInterval
  })
  console.table(newCandlesByInterval["4h"])
  return newCandlesByInterval
}


const multiIntervalStrategy = async (candles, params) => {
  let indicatorsToApply = [{functionName: "superTrend", params: [10, 3, 'supertrend']}]
  const allCandles = await dataManager.applyIndicators(candles, indicatorsToApply)
  //console.table(allCandles["5m"],['openTime', 'open', 'closeTime', 'close', 'supertrend', 'lowerband', 'upperband']);
  let intervals = Object.keys(candles)
  const balance = initBalance(candles[intervals[0]], params)
  const initialPairBalance = balance.initialPairBalance
  let newPairBalance = balance.newPairBalance
  newPairBalance.buyAtStart = params.buyAtStart
  if (intervals.length > 1) {
    if (!params.startTime) {
      console.log("Please provide startTime")
      return "Please provide startTime"
    }
  }
    //console.table(allCandles[intervals[intervals.length - 1]],['openTime', 'open', 'closeTime', 'close', 'supertrend', 'lowerband', 'upperband']);

  let firstIntervalCandles = candles[intervals[0]]
  firstIntervalCandles.map((candle, index) => {
      const firstIntervalCandle = candle;
      let iterationParams = []
      iterationParams[intervals[0]] =  { supertrend: firstIntervalCandle.supertrend,openTime: firstIntervalCandle.openTime, closeTime: firstIntervalCandle.closeTime}
      for(const interval of intervals){

        for(const [iterationUpperInterval, params] of Object.entries(iterationParams)){

          if(iterationUpperInterval !== interval){
            iterationParams[interval] = []
            for(const [index, candleOfInterval] of candles[interval].entries()){

              const actualCandleClose = moment(candleOfInterval.closeTime, 'DD-MM-YYYY hh:mm')
              const previousIntervalOpen = moment(params.openTime, 'DD-MM-YYYY hh:mm')
              const previousIntervalClose = moment(params.closeTime, 'DD-MM-YYYY hh:mm')
              if(actualCandleClose.isBetween(previousIntervalOpen, previousIntervalClose) || actualCandleClose.isSame(previousIntervalClose)){
                iterationParams[interval].push({supertrend: candleOfInterval.supertrend, openTime: candleOfInterval.openTime, closeTime: candleOfInterval.closeTime, index: index})
                const previousUpperIntervalCandle = iterationParams[iterationUpperInterval] - 1
                const upperIntervalCandle = iterationParams[iterationUpperInterval]
                const previousCandle = (candles[interval][index - 1] ? candles[interval][index - 1] : null)

                //console.log('previous', previousCandle.openTime, previousCandle.supertrend, upperIntervalCandle.supertrend)
                //console.log('current', candleOfInterval.openTime, candleOfInterval.supertrend, upperIntervalCandle.supertrend)
                if (previousCandle) {
                  //console.log(upperIntervalCandle.openTime, upperIntervalCandle.supertrend, candleOfInterval.openTime, candleOfInterval.supertrend, previousCandle.supertrend, index)
                  //console.log(candleOfInterval)
                  //console.log(upperIntervalCandle)
                  let clean = cleanIndicators(candle, upperIntervalCandle);
                  if (candleOfInterval.supertrend === 1 && upperIntervalCandle.supertrend === 1 && newPairBalance.inPosition === 0 && clean) {
                    newPairBalance.inPosition = 1;
                    buy(initialPairBalance, newPairBalance, candleOfInterval)
                  }
                  if (candleOfInterval.supertrend === 0 && previousCandle.supertrend !== candleOfInterval.supertrend && newPairBalance.inPosition === 1 && clean) {
                    //console.log("SELL", candleOfInterval.openTime, upperIntervalCandle.openTime)
                    newPairBalance.inPosition = 0;
                    sell(initialPairBalance, newPairBalance, candleOfInterval)
                  }
                }
                if (index === candles[interval].length - 1) {
                  sell(initialPairBalance, newPairBalance, candleOfInterval)
                }
                //console.log(iterationParams)
              }
            }

          }

        }

      }
    //console.log(iterationParams)
  });

  logsManager.showResults(initialPairBalance, newPairBalance)
  return newPairBalance
};


const cleanIndicators = (candle, upperCandle) =>{
  //console.log(upperCandle.openTime, upperCandle.lowerband)
  if(!isNaN(candle.atr) && !isNaN(candle.lowerband) && !isNaN(candle.upperband)){
    return true
  }else{
    return false
  }
}
const tripleSuperTrendStrategy = async (candles, params) => {
  let indicatorsToApply = [{functionName: "superTrend", params: [12, 3, 'supertrend1']},{functionName: "superTrend", params: [11, 2, 'supertrend2']}, {functionName: "superTrend", params: [10, 1, 'supertrend3']}]
  candles = await dataManager.applyIndicators(candles, indicatorsToApply)
  let intervals = Object.keys(candles)
  const balance = initBalance(candles[intervals[0]],params)
  const initialPairBalance = balance.initialPairBalance
  let newPairBalance = balance.newPairBalance
  if(intervals.length > 1){
    if(!params.startTime){
      console.log("Please provide startTime")
      return "Please provide startTime"
    }
  }
  params.i = 0;
  //le dernier interval (le plus petit) est pris par défaut pour les calculs d'achats/ventes
  for(const interval of intervals) {
    let candlesForInterval = candles[interval]
    console.table(candlesForInterval, ['openTime', 'open', 'closeTime', 'close', 'supertrend', 'lowerband', 'upperband']);

    candlesForInterval.map((candle, index) => {
      const currentCandle = candle;
      const previousCandle = candlesForInterval[index - 1];
      //buy(initialPairBalance, newPairBalance, currentCandle)
      if (previousCandle) {
        if ((currentCandle.supertrend1 === 1)
          && (currentCandle.supertrend2 === 1)
          && (currentCandle.supertrend3 === 1)) {
          buy(initialPairBalance, newPairBalance, currentCandle)
        }

        if ((candle.supertrend1 === 0)
          || (candle.supertrend2 === 0)
          || (candle.supertrend3 === 0)) {
          sell(initialPairBalance, newPairBalance, currentCandle)
        }
      }
      if (index === candles.length - 1) {
        sell(initialPairBalance, newPairBalance, currentCandle)
      }
      if (params.stopLoss) {
        enableStopLoss(params, initialPairBalance, newPairBalance, currentCandle)
      }
    });
  }

  logsManager.showResults(initialPairBalance, newPairBalance)
  return newPairBalance;
};

const superTrendStrategy = async (candles, params) => {
  let indicatorsToApply = [{functionName: "superTrend", params: [10, 3, 'supertrend']}]
  candles = await dataManager.applyIndicators(candles, indicatorsToApply)
  let intervals = Object.keys(candles)
  const balance = initBalance(candles[intervals[0]],params)
  const initialPairBalance = balance.initialPairBalance
  let newPairBalance = balance.newPairBalance
  if(intervals.length > 1){
    if(!params.startTime){
      console.log("Please provide startTime")
      return "Please provide startTime"
    }
  }
  //le dernier interval (le plus petit) est pris par défaut pour les calculs d'achats/ventes
  for(const interval of intervals){
    let candlesForInterval = candles[interval]
    //console.table(candlesForInterval,['openTime', 'open', 'closeTime', 'close', 'supertrend', 'lowerband', 'upperband']);
    if(candlesForInterval[0].supertrend === 1){
      buy(initialPairBalance, newPairBalance, candlesForInterval[0])
    }
    candlesForInterval.map((candle, index) => {

      const currentCandle = candle;
      const previousCandle = candlesForInterval[index - 1];

      if (previousCandle) {
        if (currentCandle.supertrend === 1 && previousCandle.supertrend !== currentCandle.supertrend && interval === intervals[intervals.length - 1]) {
          buy(initialPairBalance, newPairBalance, currentCandle)
        }
        if (currentCandle.supertrend === 0 && previousCandle.supertrend !== currentCandle.supertrend && interval === intervals[intervals.length - 1]) {
          sell(initialPairBalance, newPairBalance, currentCandle)
        }
      }
      if (index === candlesForInterval.length - 1 && interval === intervals[intervals.length - 1]) {
        sell(initialPairBalance, newPairBalance, currentCandle)
      }
      if(params.takeProfit && interval === intervals[intervals.length - 1]){
        enableTakeProfit(params, initialPairBalance, newPairBalance, currentCandle)
      }

      if(params.stopLoss && interval === intervals[intervals.length - 1]){
        enableStopLoss(params, initialPairBalance, newPairBalance, currentCandle)
      }

    });


    logsManager.showResults(initialPairBalance, newPairBalance)
  }


  return newPairBalance;
};

const enableTakeProfit = (params, initialPairBalance, newPairBalance, currentCandle) => {
  if(newPairBalance.trades &&
    newPairBalance.trades.length > 0 &&
    newPairBalance.trades[newPairBalance.trades.length - 1].type === "BUY")
  {
    const lastTrade = newPairBalance.trades[newPairBalance.trades.length - 1]
    const actualValueOfWallet = currentCandle.close * parseFloat(newPairBalance.asset1.free);
    const profit = calculate.calculateDifference(lastTrade.valueOfWalletAtBuy, actualValueOfWallet);

    console.log(currentCandle.openTime, lastTrade.valueOfWalletAtBuy, actualValueOfWallet, profit)
    if(profit > params.takeProfit){
      newPairBalance.takeProfitHit += 1;
      sell(initialPairBalance, newPairBalance, currentCandle);
    }
  }

}

const enableStopLoss = (params, initialPairBalance, newPairBalance, currentCandle) => {
  if(newPairBalance.trades &&
      newPairBalance.trades.length > 0 &&
      newPairBalance.trades[newPairBalance.trades.length - 1].type === "BUY")
  {
    const lastTrade = newPairBalance.trades[newPairBalance.trades.length - 1]
    const actualValueOfWallet = currentCandle.close * parseFloat(newPairBalance.asset1.free);
    const profit = calculate.calculateDifference(lastTrade.valueOfWalletAtBuy, actualValueOfWallet);

    console.log(currentCandle.openTime, lastTrade.valueOfWalletAtBuy, actualValueOfWallet, profit)
    if(profit < -Math.abs(params.stopLoss)){
      console.log("STOPLOSS", currentCandle.openTime);
      newPairBalance.stopLossHit += 1;
      sell(initialPairBalance, newPairBalance, currentCandle);
    }
  }

}

const buy = (initialPairBalance, newPairBalance, candle) => {
  let buyAmount = parseFloat(newPairBalance.asset2.free) / candle.close; // valeur de mes BUSD /  valeur du close price BNB
  let fee = (buyAmount * 0.001).toFixed(4);
  buyAmount = buyAmount - fee

  if (buyAmount !== 0) {
    const type = "BUY";
    logsManager.logBuyAndSell(type,candle,buyAmount,newPairBalance)
    newPairBalance.asset1.free = buyAmount;
    newPairBalance.asset2.previous = newPairBalance.asset2.free
    newPairBalance.asset2.free = 0;
    newPairBalance.lastTrade = type;
    const valueOfWalletAtBuy = candle.close * parseFloat(newPairBalance.asset1.free); // valeur du BNB * balance actuel en BNB
    newPairBalance.trades.push({date: candle.openTime, type: type, amount: buyAmount, assetUnitValue: candle.close, valueOfWalletAtBuy});
  }
}

const sell = (initialPairBalance, newPairBalance, candle) => {
  let sellAmount = candle.close * parseFloat(newPairBalance.asset1.free); // valeur du BNB * balance actuel en BNB
  let fee = (sellAmount * 0.001).toFixed(4);
  sellAmount = sellAmount - fee

  if (sellAmount !== 0) {
    const type = "SELL";
    const winningTrade = (sellAmount < newPairBalance.asset2.previous ? false : true)
    newPairBalance.asset2.free = sellAmount;
    newPairBalance.lastTrade = type;
    logsManager.logBuyAndSell(type,candle,sellAmount,newPairBalance)
    newPairBalance.asset1.free = 0;
    newPairBalance.trades.push({date: candle.openTime,previousProfit: newPairBalance.profit, profit:calculate.calculateProfit(initialPairBalance, newPairBalance).profit, type: "sell", amount: sellAmount, winningTrade});
  }
}


const initBalance = (candles, params) => {

  const initialPairBalance = {asset1: {asset:params.asset1, free: 0, locked: 0}, asset2:{asset:params.asset2, free: 50, locked:0}}

  if (params.asset1Balance) {
    initialPairBalance.asset1.free = parseFloat(params.asset1Balance);
  }
  if (params.asset2Balance) {
    initialPairBalance.asset2.free = parseFloat(params.asset2Balance);
  }

  let newPairBalance = JSON.parse(JSON.stringify(initialPairBalance));

  newPairBalance.asset1InitialUnitPrice = candles[0].close;
  newPairBalance.asset1FinalUnitPrice = candles[candles.length - 1].close;
  newPairBalance.trades = [];
  newPairBalance.stopLossHit = 0
  newPairBalance.takeProfitHit = 0
  newPairBalance.inPosition = 0

  return {initialPairBalance,newPairBalance}
}

module.exports = {
  superTrendEMAStrategy,
  superTrendStrategy,
  tripleSuperTrendStrategy,
  multiIntervalStrategy,
  buy,
  sell,
  initBalance,
  enableStopLoss,
  enableTakeProfit,
};
