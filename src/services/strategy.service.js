const order = require('./order.service');
const wallet = require('./wallet.service');
const indicators = require('./indicators.service');
const telegram = require('./telegram.service');
const dataManager = require('../utils/dataManager');
const sleep = require('sleep');

const superTrendEMAStrategy = async (candles, params, actualInterval) => {
  let indicatorsToApply = [{functionName: "superTrend", params: [10, 3, 'supertrend']}]
  candles = await dataManager.applyIndicators(candles, indicatorsToApply, params.realTrading)
  let pair = params.asset1 + params.asset2
  pair = pair.toUpperCase()
  let intervals = Object.keys(candles)

  for (const interval of intervals) {
    let candlesForInterval = candles[interval]

    const currentCandle = candlesForInterval[candlesForInterval.length - 1]; // pas besoin de boucle ici grâce au socket trading
    const previousCandle = candlesForInterval[candlesForInterval.length - 2];
    if (
      (currentCandle.supertrend === 1 &&
        previousCandle.supertrend !== currentCandle.supertrend &&
        currentCandle.close > currentCandle.ema) ||
      (currentCandle.supertrend === 1 && currentCandle.close > currentCandle.ema)
    ) {
      console.log("SuperTrend UP",  params.asset1 + params.asset2, "position")
      if (params.signals === "1" ) {
        params = await sendSignal(params, 'SuperTrend UP | ' + params.asset1 + params.asset2)
      } else if (params.signals === "0" && params.oneOrderSignalPassed === "1") {
        //console.table(candlesForInterval, [pair, 'openTime', 'open', 'closeTime', 'close', 'supertrend']);
        params = await makeOrder("BUY", params, currentCandle, actualInterval)
      }
      params.oneOrderSignalPassed = "1"
    }

    if (
      (currentCandle.supertrend === 0 &&
        previousCandle.supertrend !== currentCandle.supertrend &&
        currentCandle.close < currentCandle.ema) ||
      (currentCandle.supertrend === 0 && currentCandle.close < currentCandle.ema)
    ) {
      console.log("SuperTrend Down",  params.asset1 + params.asset2, currentCandle.supertrend, previousCandle.supertrend)
      if (params.signals === "1" ) {
        params = await sendSignal(params, 'SuperTrend DOWN | ' + params.asset1 + params.asset2)
      } else if (params.signals === "0" && params.oneOrderSignalPassed === "1") {
        //console.table(candlesForInterval, [pair,'openTime', 'open', 'closeTime', 'close', 'supertrend']);
        params = await makeOrder("SELL", params, currentCandle, actualInterval)
      }
      params.oneOrderSignalPassed = "1"
    }
  }

  return {candles, params}
};


const superTrendStrategy = async (candles, params, actualInterval) => {
  let indicatorsToApply = [{functionName: "superTrend", params: [10, 3, 'supertrend']}]
  candles = await dataManager.applyIndicators(candles, indicatorsToApply, params.realTrading)
  let pair = params.asset1 + params.asset2
  pair = pair.toUpperCase()
  let intervals = Object.keys(candles)

  for (const interval of intervals) {
    let candlesForInterval = candles[interval]

    const currentCandle = candlesForInterval[candlesForInterval.length - 1]; // pas besoin de boucle ici grâce au socket trading
    const previousCandle = candlesForInterval[candlesForInterval.length - 2];
    if (
      (currentCandle.supertrend === 1 &&
        previousCandle.supertrend !== currentCandle.supertrend)
    ) {
      console.log("SuperTrend UP", params.asset1 + params.asset2, "position")
      if (params.signals === "1") {
        params = await sendSignal(params, 'SuperTrend UP | ' + params.asset1 + params.asset2)
      } else if (params.signals === "0" && params.oneOrderSignalPassed === "1") {
        //console.table(candlesForInterval, [pair, 'openTime', 'open', 'closeTime', 'close', 'supertrend']);
        params = await makeOrder("BUY", params, currentCandle, actualInterval)
      }
      params.oneOrderSignalPassed = "1"
    }

    if (
      (currentCandle.supertrend === 0 &&
        previousCandle.supertrend !== currentCandle.supertrend)
    ) {
      console.log("SuperTrend Down", params.asset1 + params.asset2, "position", currentCandle.supertrend, previousCandle.supertrend)
      if (params.signals === "1") {
        params = await sendSignal(params, 'SuperTrend DOWN | ' + params.asset1 + params.asset2)
      } else if (params.signals === "0" && params.oneOrderSignalPassed === "1") {
        //console.table(candlesForInterval, [pair, 'openTime', 'open', 'closeTime', 'close', 'supertrend']);
        params = await makeOrder("SELL", params, currentCandle, actualInterval)
      }
      params.oneOrderSignalPassed = "1"
    }
  }

  return {candles, params}
};


const multiIntervalStrategy = async (candles, params, actualInterval) => {
  let indicatorsToApply = [{functionName: "superTrend", params: [10, 3, 'supertrend']}]
  candles = await dataManager.applyIndicators(candles, indicatorsToApply, params.realTrading)
  let pair = params.asset1 + params.asset2
  pair = pair.toUpperCase()
  let intervals = Object.keys(candles)
  const upperIntervalCandles = candles[intervals[0]]
  console.log("Itération :", params.i)

  if (params.lowestInterval === actualInterval) {

    let candlesForInterval = candles[actualInterval]

    const currentCandle = candlesForInterval[candlesForInterval.length - 1]; // pas besoin de boucle ici grâce au socket trading
    const previousCandle = candlesForInterval[candlesForInterval.length - 2];
    const currentUpperIntervalCandle = upperIntervalCandles[upperIntervalCandles.length - 1]
    const previousUpperIntervalCandle = upperIntervalCandles[upperIntervalCandles.length - 2]
    //console.log(pair, "position", "previousTrend", previousCandle.supertrend, "currentTrend", currentCandle.supertrend, "currentUpperTrend", currentUpperIntervalCandle.supertrend)

    if (params.i === 3) {
      candles[actualInterval][candles[actualInterval].length - 2].supertrend = 1
      candles[actualInterval][candles[actualInterval].length - 1].supertrend = 0
    }

    if (
        ((currentCandle.supertrend === 1 &&
          previousCandle.supertrend !== currentCandle.supertrend &&
          currentUpperIntervalCandle.supertrend === 1)
          ||
          (currentCandle.supertrend === 1 &&
            currentUpperIntervalCandle.supertrend === 1 &&
            previousUpperIntervalCandle.supertrend !== currentUpperIntervalCandle.supertrend)
        )
      ) {
          console.log("SuperTrend UP",  params.asset1 + params.asset2, "position")
          if (params.signals === "1") {
            params = await sendSignal(params, 'SuperTrend UP | ' + params.asset1 + params.asset2)
          } else if (params.signals === "0" && params.oneOrderSignalPassed === "1") {
            //console.table(candlesForInterval, [pair, 'openTime', 'open', 'closeTime', 'close', 'supertrend']);
            params = await makeOrder("BUY", params, currentCandle, actualInterval)
          }
          params.oneOrderSignalPassed = "1"
      }

      if (
        (currentCandle.supertrend === 0 &&
          previousCandle.supertrend !== currentCandle.supertrend)
      ) {
          console.log("SuperTrend Down",  params.asset1 + params.asset2, "position", currentCandle.supertrend, previousCandle.supertrend)
          if (params.signals === "1") {
            params = await sendSignal(params, 'SuperTrend DOWN | ' + params.asset1 + params.asset2)
          } else if (params.signals === "0" && params.oneOrderSignalPassed === "1") {
            //console.table(candlesForInterval, [pair,'openTime', 'open', 'closeTime', 'close', 'supertrend']);
            params = await makeOrder("SELL", params, currentCandle, actualInterval)
          }
          params.oneOrderSignalPassed = "1"
      }
  }

  return {candles, params}

};


const sendSignal = async (params, text) => {

  await telegram.sendMessage(text)

  return params
}

const makeOrder = async (side, params, currentCandle, actualInterval) => {
  console.log("makeOrder")
  let tokenAlreadyBought = false;

  let allTokensInPosition = await wallet.getActualCoins()

  allTokensInPosition.map((token) => {
    if(token.asset1 === params.asset1){
      tokenAlreadyBought = true;
    }
  })

  let orderParams = {
    side: side,
    type: 'MARKET'
  }

  if(side === "BUY" && !tokenAlreadyBought){
    await order.newOrder(orderParams, params, actualInterval);
  }else if(side === "SELL"){
    await order.newOrder(orderParams, params, actualInterval);
  }

  return params
}


const superTrendFind = async (candles, params) => {
  let indicatorsToApply = [{functionName: "superTrend", params: [10, 3, 'supertrend']}]
  candles = await dataManager.applyIndicators(candles, indicatorsToApply, params.realTrading)

  let intervals = Object.keys(candles)
  for (const interval of intervals) {
    let candlesForInterval = candles[interval]

    const currentCandle = candlesForInterval[candlesForInterval.length - 1]; // pas besoin de boucle ici grâce au socket trading
    if (
      (currentCandle.supertrend === 1)
    ) {
      await telegram.sendMessage('SuperTrend UP | ' + params.asset1 + params.asset2)
    }

    if (
      (currentCandle.supertrend === 0)
    ) {
      await telegram.sendMessage('SuperTrend DOWN | ' + params.asset1 + params.asset2)
    }

  }

  return {candles, params}
};


const multiIntervalFind = async (candles, params, actualInterval) => {

  let indicatorsToApply = [{functionName: "superTrend", params: [10, 3, 'supertrend']}]
  candles = await dataManager.applyIndicators(candles, indicatorsToApply, params.realTrading)
  let pair = params.asset1 + params.asset2
  pair = pair.toUpperCase()
  let intervals = Object.keys(candles)
  const upperIntervalCandles = candles[intervals[0]]


  if (params.lowestInterval === actualInterval) {

    let candlesForInterval = candles[params.lowestInterval]

    const currentCandle = candlesForInterval[candlesForInterval.length - 1]; // pas besoin de boucle ici grâce au socket trading
    const previousCandle = candlesForInterval[candlesForInterval.length - 2];
    const currentUpperIntervalCandle = upperIntervalCandles[upperIntervalCandles.length - 1]
    //console.log(pair, "previousTrend", previousCandle.supertrend, "currentTrend", currentCandle.supertrend, "currentUpperTrend", currentUpperIntervalCandle.supertrend)
    if (
      (currentCandle.supertrend === 1 &&
        previousCandle.supertrend !== currentCandle.supertrend)
    ) {
      console.log('SuperTrend UP | ' + params.asset1 + params.asset2)
      if (params.signals === "1") {
        await telegram.sendMessage('SuperTrend UP | ' + params.asset1 + params.asset2)
      }
    }

    if (
      (currentCandle.supertrend === 0 &&
        previousCandle.supertrend !== currentCandle.supertrend)
    ) {
      console.log('SuperTrend DOWN | ' + params.asset1 + params.asset2)
      if (params.signals === "1") {
        await telegram.sendMessage('SuperTrend DOWN | ' + params.asset1 + params.asset2)
      }
    }
  }
  params.i = params.i + 1;

  return {candles, params}
};

module.exports = {
  superTrendEMAStrategy,
  superTrendStrategy,
  multiIntervalStrategy,
  superTrendFind,
  multiIntervalFind
};
