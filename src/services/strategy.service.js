const order = require('./order.service');
const wallet = require('./wallet.service');
const indicators = require('./indicators.service');
const telegram = require('./telegram.service');
const dataManager = require('../utils/dataManager');


const superTrendEMAStrategy = async (candles, params) => {
  candles = await indicators.superTrend(candles, 10, 3);
  candles = await indicators.EMA(candles, 200);
  console.table(candles, ['openTime', 'open', 'closeTime', 'close', 'supertrend', 'ema']);

  const requirements = await order.getRequirements(params.asset1 + params.asset2)
  const currentCandle = candles[candles.length - 1];
  const previousCandle = candles[candles.length - 2];
  let pairBalance = null
  let inPosition = false;
  const checkPosition = await wallet.checkPosition(params, requirements,params.inPosition, currentCandle.close)
  console.log(checkPosition)
  inPosition = checkPosition.inPosition
  pairBalance = checkPosition.pairBalance

  if (
    (currentCandle.supertrend === 1 &&
      previousCandle.supertrend !== currentCandle.supertrend &&
      currentCandle.close > currentCandle.ema && inPosition === false) ||
    (currentCandle.supertrend === 1 && currentCandle.close > currentCandle.ema && inPosition === false)
  ) {
    if (params.signals === '1') {
      await telegram.sendMessage(params.asset1 + " UPTREND")
    } else {
      await order.newOrder({asset1: params.asset1, asset2: params.asset2, side: 'BUY', type: 'MARKET'});
    }
    console.log(currentCandle.closeTime, 'BUY');
  }

  if (
    (currentCandle.supertrend === 0 &&
      previousCandle.supertrend !== currentCandle.supertrend &&
      currentCandle.close < currentCandle.ema && inPosition === true) ||
    (currentCandle.supertrend === 0 && currentCandle.close < currentCandle.ema && inPosition === true)
  ) {
    if (params.signals === '1') {
      await telegram.sendMessage(params.asset1 + " DOWNTREND")
    } else {
      await order.newOrder({asset1: params.asset1, asset2: params.asset2, side: 'SELL', type: 'MARKET'});
    }
    console.log(currentCandle.closeTime, 'SELL');
  }

  return {balance: pairBalance, candles: candles};
};


const superTrendStrategy = async (candles, params) => {
  let indicatorsToApply = [{functionName: "superTrend", params: [10, 3, 'supertrend']}]
  candles = await dataManager.applyIndicators(candles, indicatorsToApply)
  params.i = params.i + 1;



  //console.log(candles["1m"][candles["1m"].length - 1])
  let intervals = Object.keys(candles)
  //console.table(candles["1m"],['openTime', 'open', 'closeTime', 'close', 'supertrend', 'lowerband', 'upperband']);
  for (const interval of intervals) {
    let candlesForInterval = candles[interval]

    const currentCandle = candlesForInterval[candlesForInterval.length - 1]; // pas besoin de boucle ici grâce au socket trading
    const previousCandle = candlesForInterval[candlesForInterval.length - 2];
    console.log("position", params.inPosition, "previousTrend", previousCandle.supertrend, "currentTrend", currentCandle.supertrend)
    if (
      (currentCandle.supertrend === 1 &&
        previousCandle.supertrend !== currentCandle.supertrend)
    ) {
      console.log('SuperTrend UP | ' + params.asset1 + params.asset2)
      if (params.signals === "1") {
        await telegram.sendMessage('SuperTrend UP | ' + params.asset1 + params.asset2)
      }
      else if (params.signals === "0"  && params.inPosition === "0") {
        await order.newOrder({asset1: params.asset1, asset2: params.asset2, side: 'BUY', type: 'MARKET'});
        await telegram.sendMessage('BUY ' + params.asset1 + params.asset2)
        const requirements = await order.getRequirements(params.asset1 + params.asset2)
        const checkPosition = await wallet.checkPosition(params, requirements, params.inPosition, currentCandle.close)
        params.inPosition = "1";
        params.pairBalance = checkPosition.pairBalance
      }
    }

    if (
      (currentCandle.supertrend === 0 &&
        previousCandle.supertrend !== currentCandle.supertrend)
    ) {
      console.log('SuperTrend DOWN | ' + params.asset1 + params.asset2)
      if (params.signals === "1") {
        console.log(currentCandle)
        await telegram.sendMessage('SuperTrend DOWN | ' + params.asset1 + params.asset2)
      } else if (params.signals === "0" && params.inPosition === "1") {
        await order.newOrder({asset1: params.asset1, asset2: params.asset2, side: 'SELL', type: 'MARKET'});
        await telegram.sendMessage('SELL ' + params.asset1 + params.asset2)
        const requirements = await order.getRequirements(params.asset1 + params.asset2)
        const checkPosition = await wallet.checkPosition(params, requirements, params.inPosition, currentCandle.close)
        params.inPosition = "0"
        params.pairBalance = checkPosition.pairBalance
      }
    }
  }

  return {candles, params}
};


const multiIntervalStrategy = async (candles, params) => {
  let indicatorsToApply = [{functionName: "superTrend", params: [10, 3, 'supertrend']}]
  candles = await dataManager.applyIndicators(candles, indicatorsToApply)
  params.i = params.i + 1;

  //console.log(candles["1m"][candles["1m"].length - 1])
  let intervals = Object.keys(candles)
  const upperIntervalCandles = candles[intervals[0]]

  //console.table(candles["1m"],['openTime', 'open', 'closeTime', 'close', 'supertrend', 'lowerband', 'upperband']);
  for (const interval of intervals) {
    let candlesForInterval = candles[interval]

    const currentCandle = candlesForInterval[candlesForInterval.length - 1]; // pas besoin de boucle ici grâce au socket trading
    const previousCandle = candlesForInterval[candlesForInterval.length - 2];
    const currentUpperIntervalCandle = upperIntervalCandles[upperIntervalCandles.length - 1]
    //console.log("position", params.inPosition, "previousTrend", previousCandle.supertrend, "currentTrend", currentCandle.supertrend, "currentUpperTrend", currentUpperIntervalCandle.supertrend)

    if (
      (currentCandle.supertrend === 1 &&
        previousCandle.supertrend !== currentCandle.supertrend)
    ) {
      console.log('SuperTrend UP | ' + params.asset1 + params.asset2)
      if (params.signals === "1") {
        await telegram.sendMessage('SuperTrend UP | ' + params.asset1 + params.asset2)
      }
      else if (params.signals === "0"  && params.inPosition === "0" && currentUpperIntervalCandle.supertrend === 1) {
        await order.newOrder({asset1: params.asset1, asset2: params.asset2, side: 'BUY', type: 'MARKET'});
        await telegram.sendMessage('BUY ' + params.asset1 + params.asset2)
        const requirements = await order.getRequirements(params.asset1 + params.asset2)
        const checkPosition = await wallet.checkPosition(params, requirements, params.inPosition, currentCandle.close)
        params.inPosition = "1";
        params.pairBalance = checkPosition.pairBalance
      }
    }

    if (
      (currentCandle.supertrend === 0 &&
        previousCandle.supertrend !== currentCandle.supertrend)
    ) {
      console.log('SuperTrend DOWN | ' + params.asset1 + params.asset2)
      if (params.signals === "1") {
        console.log(currentCandle)
        await telegram.sendMessage('SuperTrend DOWN | ' + params.asset1 + params.asset2)
      } else if (params.signals === "0" && params.inPosition === "1") {
        await order.newOrder({asset1: params.asset1, asset2: params.asset2, side: 'SELL', type: 'MARKET'});
        await telegram.sendMessage('SELL ' + params.asset1 + params.asset2)
        const requirements = await order.getRequirements(params.asset1 + params.asset2)
        const checkPosition = await wallet.checkPosition(params, requirements, params.inPosition, currentCandle.close)
        params.inPosition = "0"
        params.pairBalance = checkPosition.pairBalance
      }
    }
  }

  return {candles, params}
};

module.exports = {
  superTrendEMAStrategy,
  superTrendStrategy,
  multiIntervalStrategy
};
