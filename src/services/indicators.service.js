const indicators = require('technicalindicators');
const dataFormater = require('./dataFormat.service');
const Ichimoku = require('ichimoku')
/* eslint-disable no-param-reassign */

const EMA = async(data, period) => {
  const candles = await dataFormater.talibFormat(data);
  const closingCandles = dataFormater.convertAllToNumber(candles.close);
  let ema = await indicators.EMA.calculate({ period, values: closingCandles});
  ema = dataFormater.manageEmptyRow(data, 'EMA', ema);
  data.map((candle, index) => {
    data[index].ema = ema[index];
  });
  return data;
};

const ichimoku = async(data) => {
  const ichimoku = new Ichimoku({
    conversionPeriod : 9,
    basePeriod       : 26,
    spanPeriod       : 52,
    displacement     : 26,
    values           : []
  })
  let candles = []
  for( let [index, candle] of data.entries() ) {
    let ichimokuValue = ichimoku.nextValue({
      high  : candle.high,
      low   : candle.low,
      close : candle.close,
    })
    if(index >= 25){
      if(ichimokuValue && ichimokuValue.spanA !== 0 && ichimokuValue.spanB !== 0){
        let ichimokuObject = Object.assign({}, candle, ichimokuValue)
        candles.push(ichimokuObject)
      }
    }
  }

  for([index, candle] of candles.entries()){
    if(index >= 25){
      const lagging = candles[index - 25]
      candles[index].laggingTime = lagging.openTime
      candles[index].laggingBase = lagging.base
      candles[index].laggingSpanB = lagging.spanB
    }
  }

  candles.pop()
  return candles;
};


const ATR = async (data, period) => {
  const candles = await dataFormater.talibFormat(data);
  candles.period = period;
  let atr = indicators.ATR.calculate(candles);
  atr = dataFormater.manageEmptyRow(data, 'ATR', atr);
  data.map((candle, index) => {
    data[index].atr = atr[index];
  });
  return { data, atrArray: atr };
};

const superTrend = async (data, period, multiplier, trendName = 'supertrend') => {
  // atr
  const atrData = await ATR(data, period);
  data = atrData.data;
  await Promise.all(
    data.map(async (candle, index) => {
      const previous = index - 1;
      const superTrendAverage = (parseFloat(data[index].high) + parseFloat(data[index].low)) / 2;
      const superTrendHigherBand = superTrendAverage + multiplier * data[index].atr;
      const superTrendLowerBand = superTrendAverage - multiplier * data[index].atr;
      data[index].lowerband = superTrendLowerBand;
      data[index].upperband = superTrendHigherBand;
      data[index][trendName] = 1;


      if (data[previous] !== undefined) {
        if (data[index].close > data[previous].upperband) {
          data[index][trendName] = 1;
        } else if (data[index].close < data[previous].lowerband) {
          data[index][trendName] = 0;
        } else {
          data[index][trendName] = data[previous][trendName];
          if (data[index][trendName] === 1 && data[index].lowerband < data[previous].lowerband){
            data[index].lowerband = data[previous].lowerband;
          }
          if (data[index][trendName] === 0 && data[index].upperband > data[previous].upperband){
            data[index].upperband = data[previous].upperband;
          }
        }
      }
    })
  );

  return data;
};




module.exports = {
  EMA,
  ATR,
  superTrend,
  ichimoku
};
