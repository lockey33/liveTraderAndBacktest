const order = require('./order.service');
const wallet = require('./wallet.service');
const indicators = require('./indicators.service');
const telegram = require('./telegram.service');
const dataManager = require('../utils/dataManager');
const sleep = require('sleep');

const superTrendEMAStrategy = async (candles, params) => {
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
      console.log("SuperTrend UP",  params.asset1 + params.asset2, "position", params.inPosition)
      if (params.signals === "1" && params.inPosition === "0") {
        params = await sendSignal(params, 'SuperTrend UP | ' + params.asset1 + params.asset2)
      } else if (params.signals === "0" && params.oneOrderSignalPassed === "1") {
        console.table(candlesForInterval, [pair, 'openTime', 'open', 'closeTime', 'close', 'supertrend']);
        params = await makeOrder("BUY", params, currentCandle, interval)
      }
      params.oneOrderSignalPassed = "1"
    }

    if (
      (currentCandle.supertrend === 0 &&
        previousCandle.supertrend !== currentCandle.supertrend &&
        currentCandle.close < currentCandle.ema) ||
      (currentCandle.supertrend === 0 && currentCandle.close < currentCandle.ema)
    ) {
      console.log("SuperTrend Down",  params.asset1 + params.asset2, "position", params.inPosition, currentCandle.supertrend, previousCandle.supertrend)
      if (params.signals === "1" && params.inPosition === "1") {
        params = await sendSignal(params, 'SuperTrend DOWN | ' + params.asset1 + params.asset2)
      } else if (params.signals === "0" && params.oneOrderSignalPassed === "1") {
        console.table(candlesForInterval, [pair,'openTime', 'open', 'closeTime', 'close', 'supertrend']);
        params = await makeOrder("SELL", params, currentCandle, interval)
      }
      params.oneOrderSignalPassed = "1"
    }
  }

  return {candles, params}
};


const superTrendStrategy = async (candles, params) => {
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
      console.log("SuperTrend UP", params.asset1 + params.asset2, "position", params.inPosition)
      if (params.signals === "1" && params.inPosition === "0") {
        params = await sendSignal(params, 'SuperTrend UP | ' + params.asset1 + params.asset2)
      } else if (params.signals === "0" && params.oneOrderSignalPassed === "1") {
        console.table(candlesForInterval, [pair, 'openTime', 'open', 'closeTime', 'close', 'supertrend']);
        params = await makeOrder("BUY", params, currentCandle, interval)
      }
      params.oneOrderSignalPassed = "1"
    }

    if (
      (currentCandle.supertrend === 0 &&
        previousCandle.supertrend !== currentCandle.supertrend && params.inPosition === "0")
    ) {
      console.log("SuperTrend Down", params.asset1 + params.asset2, "position", params.inPosition, currentCandle.supertrend, previousCandle.supertrend)
      if (params.signals === "1" && params.inPosition === "1") {
        params = await sendSignal(params, 'SuperTrend DOWN | ' + params.asset1 + params.asset2)
      } else if (params.signals === "0" && params.oneOrderSignalPassed === "1") {
        console.table(candlesForInterval, [pair, 'openTime', 'open', 'closeTime', 'close', 'supertrend']);
        params = await makeOrder("SELL", params, currentCandle, interval)
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

  /*
      if(params.waitForClose === "0"){
        params = await managePosition(params, candles, actualInterval)
      }
  */

    let candlesForInterval = candles[actualInterval]

    const currentCandle = candlesForInterval[candlesForInterval.length - 1]; // pas besoin de boucle ici grâce au socket trading
    const previousCandle = candlesForInterval[candlesForInterval.length - 2];
    const currentUpperIntervalCandle = upperIntervalCandles[upperIntervalCandles.length - 1]
    const previousUpperIntervalCandle = upperIntervalCandles[upperIntervalCandles.length - 2]
    //console.log(pair, "position", params.inPosition, "previousTrend", previousCandle.supertrend, "currentTrend", currentCandle.supertrend, "currentUpperTrend", currentUpperIntervalCandle.supertrend)

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
          console.log("SuperTrend UP",  params.asset1 + params.asset2, "position", params.inPosition)
          if (params.signals === "1" && params.inPosition === "0") {
            params = await sendSignal(params, 'SuperTrend UP | ' + params.asset1 + params.asset2)
          } else if (params.signals === "0" && params.oneOrderSignalPassed === "1") {
            console.table(candlesForInterval, [pair, 'openTime', 'open', 'closeTime', 'close', 'supertrend']);
            params = await makeOrder("BUY", params, currentCandle, actualInterval)
          }
          params.oneOrderSignalPassed = "1"
      }

      if (
        (currentCandle.supertrend === 0 &&
          previousCandle.supertrend !== currentCandle.supertrend)
      ) {
          console.log("SuperTrend Down",  params.asset1 + params.asset2, "position", params.inPosition, currentCandle.supertrend, previousCandle.supertrend)
          if (params.signals === "1" && params.inPosition === "1") {
            params = await sendSignal(params, 'SuperTrend DOWN | ' + params.asset1 + params.asset2)
          } else if (params.signals === "0" && params.oneOrderSignalPassed === "1") {
            console.table(candlesForInterval, [pair,'openTime', 'open', 'closeTime', 'close', 'supertrend']);
            params = await makeOrder("SELL", params, currentCandle, actualInterval)
          }
          params.oneOrderSignalPassed = "1"
      }
  }

  return {candles, params}

};

// permet de ne pas avoir a attendre les clotures de bougie mais je met cette fonction en suspend pour l'instant, le params.inPosition n'est pas sécurisant pour certains cas
const managePosition = async (params, candles, actualInterval) => {
  const currentCandle = candles[actualInterval][candles[actualInterval].length - 1]


  if (params.i === parseInt(params.spacing) && params.signals === "0") {
    const requirements = await coinInfos.getRequirements(params.asset1 + params.asset2)
    const checkPosition = await wallet.checkPosition(params, requirements, "0", currentCandle.close)
    params.inPosition = checkPosition.inPosition
    if(params.inPosition === "1"){
      params.oneOrderSignalPassed = "1";
    }
  }

  //si on est en position alors que la supertrend est DOWN
  if (params.inPosition === "1" && currentCandle.supertrend === 0 && params.signals === "0" && params.oneOrderSignalPassed === "1") {
      console.log('managePosition SELL', actualInterval)
      await makeOrder(params, currentCandle, actualInterval)
  }
  // si on est pas en position alors que la supertrend est UP
  if (params.inPosition === "0" && currentCandle.supertrend === 1 && params.signals === "0" && params.oneOrderSignalPassed === "1") {
      console.log('managePosition BUY', actualInterval)
      await makeOrder(params, currentCandle, actualInterval)
  }

  return params
}

const sendSignal = async (params, text) => {

  await telegram.sendMessage(text)
  params.inPosition = (params.inPosition === "1" ? params.inPosition = "0" : params.inPosition = "1");

  return params
}

const makeOrder = async (side, params, currentCandle, actualInterval) => {

  console.log("makeOrder")

  let tokenAlreadyBought = false;

  sleep.sleep(10)

  let allTokensInPosition = await wallet.getActualCoins()

  sleep.sleep(10)

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

  let pair = params.asset1 + params.asset2
  pair = pair.toUpperCase()

  if (params.i === 1 && params.signals === "0") {
    console.log('params', params)
    const requirements = await coinInfos.getRequirements(params.asset1 + params.asset2)
    const checkPosition = await wallet.checkPosition(params, requirements, "0", candles[params.targetInterval][candles[params.lowestInterval].length - 1].close)
    console.log('check', checkPosition)
    params.inPosition = checkPosition.inPosition
  }

  let intervals = Object.keys(candles)
  for (const interval of intervals) {
    let candlesForInterval = candles[interval]

    const currentCandle = candlesForInterval[candlesForInterval.length - 1]; // pas besoin de boucle ici grâce au socket trading
    const previousCandle = candlesForInterval[candlesForInterval.length - 2];
    if (
      (currentCandle.supertrend === 1 && params.inPosition === "0")
    ) {
      console.log(params)
      await telegram.sendMessage('SuperTrend UP | ' + params.asset1 + params.asset2)
      params.inPosition = "1";
    }

    if (
      (currentCandle.supertrend === 0 && params.inPosition === "1")
    ) {
      console.log(params)
      //console.log("liveCandle:", params.liveCandle,"superTrendConfirmed", pair, "position", params.inPosition, "previousTrend", previousCandle.supertrend, "currentTrend", currentCandle.supertrend)
      await telegram.sendMessage('SuperTrend DOWN | ' + params.asset1 + params.asset2)
      params.inPosition = "0";

    }

  }
  params.i = params.i + 1;

  return {candles, params}
};


const multiIntervalFind = async (candles, params, actualInterval) => {

  let indicatorsToApply = [{functionName: "superTrend", params: [10, 3, 'supertrend']}]
  candles = await dataManager.applyIndicators(candles, indicatorsToApply, params.realTrading)
  let pair = params.asset1 + params.asset2
  pair = pair.toUpperCase()
  let intervals = Object.keys(candles)
  const upperIntervalCandles = candles[intervals[0]]

/*  if (params.i === 1 && params.signals === "0") {
    const requirements = await coinInfos.getRequirements(params.asset1 + params.asset2)
    const checkPosition = await wallet.checkPosition(params, requirements, "0", candles[params.lowestInterval][candles[params.lowestInterval].length - 1].close)
    params.inPosition = checkPosition.inPosition
  }*/

  if (params.lowestInterval === actualInterval) {

    let candlesForInterval = candles[params.lowestInterval]

    const currentCandle = candlesForInterval[candlesForInterval.length - 1]; // pas besoin de boucle ici grâce au socket trading
    const previousCandle = candlesForInterval[candlesForInterval.length - 2];
    const currentUpperIntervalCandle = upperIntervalCandles[upperIntervalCandles.length - 1]
    //console.log(pair, "position", params.inPosition, "previousTrend", previousCandle.supertrend, "currentTrend", currentCandle.supertrend, "currentUpperTrend", currentUpperIntervalCandle.supertrend)
    if (
      (currentCandle.supertrend === 1 &&
        previousCandle.supertrend !== currentCandle.supertrend && params.inPosition === "0")
    ) {
      console.log('SuperTrend UP | ' + params.asset1 + params.asset2)
      if (params.signals === "1") {
        await telegram.sendMessage('SuperTrend UP | ' + params.asset1 + params.asset2)
        params.inPosition = "1";
      }
    }

    if (
      (currentCandle.supertrend === 0 &&
        previousCandle.supertrend !== currentCandle.supertrend && params.inPosition === "1")
    ) {
      console.log('SuperTrend DOWN | ' + params.asset1 + params.asset2)
      if (params.signals === "1") {
        await telegram.sendMessage('SuperTrend DOWN | ' + params.asset1 + params.asset2)
        params.inPosition = "0"
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
