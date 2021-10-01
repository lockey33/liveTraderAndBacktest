const wallet = require('./wallet.service');
const calculate = require('../utils/calculate');
const indicators = require('./indicators.service');
const logsManager = require('../utils/logsManager');
const moment = require('moment');

const superTrendEMAStrategy = async (candles, params) => {
  candles = await indicators.superTrend(candles, 10, 3);
  candles = await indicators.EMA(candles, 200);
  const initialPairBalance = {asset1: {asset:params.asset1, free: 0, locked: 0}, asset2:{asset:params.asset2, free: 500, locked:0}}

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

  candles.map((candle, index) => {
    const currentCandle = candle;
    const previousCandle = candles[index - 1];
    if (previousCandle) {
      if (
        (currentCandle.supertrend === 1 &&
          previousCandle.supertrend !== currentCandle.supertrend &&
          currentCandle.close > currentCandle.ema) ||
        (currentCandle.supertrend === 1 && currentCandle.close > currentCandle.ema)
      ) {
        buy(initialPairBalance, newPairBalance, candle)
      }

      if (
        (currentCandle.supertrend === 0 &&
          previousCandle.supertrend !== currentCandle.supertrend &&
          currentCandle.close < currentCandle.ema) ||
        (currentCandle.supertrend === 0 && currentCandle.close < currentCandle.ema)
      ) {
        sell(initialPairBalance, newPairBalance, candle)
      }
    }
    if (index === candles.length - 1) {
      sell(initialPairBalance, newPairBalance, candle)
    }
  });

  logsManager.showResults(initialPairBalance, newPairBalance)

  return newPairBalance;
};

const superTrendStrategy = async (candles, params) => {
  candles = await indicators.superTrend(candles, 10, 3, 'supertrend');
  console.table(candles,['openTime', 'open', 'closeTime', 'close', 'supertrend', 'lowerband', 'upperband']);
  const initialPairBalance = {asset1: {asset:params.asset1, free: 0, locked: 0}, asset2:{asset:params.asset2, free: 500, locked:0}}

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

  candles.map((candle, index) => {
    const currentCandle = candle;
    const previousCandle = candles[index - 1];
    if (previousCandle) {
      if (currentCandle.supertrend === 1 && previousCandle.supertrend !== currentCandle.supertrend) {
          buy(initialPairBalance, newPairBalance, candle)
      }
      if (candle.supertrend === 0 && previousCandle.supertrend !== currentCandle.supertrend) {
        sell(initialPairBalance, newPairBalance, candle)
      }
    }
    if (index === candles.length - 1) {
      sell(initialPairBalance, newPairBalance, candle)
    }
    if(params.stopLoss && newPairBalance.trades && newPairBalance.trades.length > 0 && newPairBalance.trades[newPairBalance.trades.length - 1].type === "BUY"){
        const lastTrade = newPairBalance.trades[newPairBalance.trades.length - 1]
        const actualValueOfWallet = currentCandle.close * parseFloat(newPairBalance.asset1.free);
        const profit = calculate.calculateDifference(lastTrade.valueOfWalletAtBuy, actualValueOfWallet);

        console.log(candle.openTime, lastTrade.valueOfWalletAtBuy, actualValueOfWallet)
        if(profit < -Math.abs(params.stopLoss)){
          console.log("STOPLOSS", candle.openTime);
          newPairBalance.stopLossHit += 1;
          sell(initialPairBalance, newPairBalance, candle);
        }
    }

  });

  logsManager.showResults(initialPairBalance, newPairBalance)

  return newPairBalance;
};

const tripleSuperTrendStrategy = async (candles, params) => {

  candles = await indicators.superTrend(candles, 12, 3, 'supertrend1');
  candles = await indicators.superTrend(candles, 11, 2, 'supertrend2');
  candles = await indicators.superTrend(candles, 10, 1, 'supertrend3');

  console.table(candles,['openTime', 'open', 'closeTime', 'close', 'supertrend1', 'supertrend2', 'supertrend3']);

  const initialPairBalance = {asset1: {asset:params.asset1, free: 0, locked: 0}, asset2:{asset:params.asset2, free: 500, locked:0}}

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

  candles.map((candle, index) => {
    const currentCandle = candle;
    const previousCandle = candles[index - 1];
    if (previousCandle) {
      if ((currentCandle.supertrend1 === 1)
        && (currentCandle.supertrend2 === 1)
        && (currentCandle.supertrend3 === 1)) {
          buy(initialPairBalance, newPairBalance, candle)
      }

      if ((candle.supertrend1 === 0)
        || (candle.supertrend2 === 0)
        || (candle.supertrend3 === 0)) {
          sell(initialPairBalance, newPairBalance, candle)
      }
    }
    if (index === candles.length - 1) {
      sell(initialPairBalance, newPairBalance, candle)
    }

  });

  logsManager.showResults(initialPairBalance, newPairBalance)
  return newPairBalance;
};


const buy = (initialPairBalance, newPairBalance, candle) => {
  const buyAmount = parseFloat(newPairBalance.asset2.free) / candle.close; // valeur de mes BUSD /  valeur du close price BNB
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
  const sellAmount = candle.close * parseFloat(newPairBalance.asset1.free); // valeur du BNB * balance actuel en BNB
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
module.exports = {
  superTrendEMAStrategy,
  superTrendStrategy,
  tripleSuperTrendStrategy,
  buy,
  sell,
};
