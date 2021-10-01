const order = require('./order.service');
const wallet = require('./wallet.service');
const indicators = require('./indicators.service');
const telegram = require('./telegram.service');

const superTrendEMAStrategy = async (candles, params) => {
  candles = await indicators.superTrend(candles, 10, 3);
  candles = await indicators.EMA(candles, 200);
  console.table(candles,['openTime', 'open', 'closeTime', 'close', 'supertrend', 'ema']);

  const requirements = await order.getRequirements(params.asset1+params.asset2)
  const pairBalance = await wallet.getPairBalance({ asset1: params.asset1, asset2: params.asset2 });
  const currentCandle = candles[candles.length - 1];
  const previousCandle = candles[candles.length - 2];

  let inPosition = false;
  if(pairBalance.asset1.free > requirements.minQty){
    inPosition = true;
    //console.log("IN POSITION")
  }
  if (
    (currentCandle.supertrend === 1 &&
      previousCandle.supertrend !== currentCandle.supertrend &&
      currentCandle.close > currentCandle.ema && inPosition === false) ||
    (currentCandle.supertrend === 1 && currentCandle.close > currentCandle.ema && inPosition === false)
  ) {
    if(params.signals === '1'){
      await telegram.sendMessage(params.asset1 + " UPTREND")
    }else{
      await order.newOrder({ asset1: params.asset1, asset2: params.asset2, side: 'BUY', type: 'MARKET' });
    }
    console.log(currentCandle.closeTime, 'BUY');
  }

  if (
    (currentCandle.supertrend === 0 &&
      previousCandle.supertrend !== currentCandle.supertrend &&
      currentCandle.close < currentCandle.ema && inPosition === true) ||
    (currentCandle.supertrend === 0 && currentCandle.close < currentCandle.ema && inPosition === true)
  ) {
    if(params.signals === '1'){
      await telegram.sendMessage(params.asset1 + " DOWNTREND")
    }else{
      await order.newOrder({ asset1: params.asset1, asset2: params.asset2, side: 'SELL', type: 'MARKET' });
    }
    console.log(currentCandle.closeTime, 'SELL');
  }

  return {balance: pairBalance, candles: candles};
};


const superTrendStrategy = async (candles, params) => {
  candles = await indicators.superTrend(candles, 10, 3);
  //console.table(candles,['openTime', 'open', 'closeTime', 'close', 'supertrend']);
  const requirements = await order.getRequirements(params.asset1+params.asset2)
  let pairBalance = null
  let inPosition = false;
  if(!params.lastTrend){
    params.lastTrend = candles[candles.length - 1].supertrend
  }
  if(params.signals !== "1"){
    pairBalance = await wallet.getPairBalance({ asset1: params.asset1, asset2: params.asset2 });
    if(pairBalance.asset1.free > requirements.minQty){
      inPosition = true;
      console.log("IN POSITION")
    }
  }
  const currentCandle = candles[candles.length - 1];
  const previousCandle = candles[candles.length - 2];


  if (
    (params.lastTrend === 0 && currentCandle.supertrend === 1 &&
      previousCandle.supertrend !== currentCandle.supertrend)
  ) {
      if(params.signals === "1"){
        console.log('SuperTrend UP | '+ params.asset1 + params.asset2)
        await telegram.sendMessage('SuperTrend UP | '+ params.asset1 + params.asset2)
        //console.log(currentCandle)
      }else{
        await order.newOrder({ asset1: params.asset1, asset2: params.asset2, side: 'BUY', type: 'MARKET' });
      }
      //currentCandle.candleProcessed = 1;
      params.lastTrend = 1
  }

  if (
    (params.lastTrend === 1 && currentCandle.supertrend === 0 &&
      previousCandle.supertrend !== currentCandle.supertrend)
  ) {
      if (params.signals === "1") {
        console.log('SuperTrend DOWN | ' + params.asset1 + params.asset2)
        console.log(currentCandle)
        await telegram.sendMessage('SuperTrend DOWN | ' + params.asset1 + params.asset2)
      } else {
        await order.newOrder({asset1: params.asset1, asset2: params.asset2, side: 'SELL', type: 'MARKET'});
      }
      //currentCandle.candleProcessed = 1;
      params.lastTrend = 0
    //console.log(currentCandle.closeTime, 'SELL');
  }
  return{candles , params}
  //return {balance: pairBalance, candles: candles};
};


module.exports = {
  superTrendEMAStrategy,
  superTrendStrategy,
};
