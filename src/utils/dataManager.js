const indicatorService = require('../services/indicators.service');


const highest = (array) => {
  return Math.max.apply(Math, array);
};

const lowest = (array) => {
  return Math.min.apply(Math, array);
};



const candleProcessed = (data, index) => {
  data[index].candleProcessed = 1;
  return data
}

applyIndicators = async(allCandles, indicators) => {
  let intervals = Object.keys(allCandles)
  for(const interval of intervals){
    for(const indicator of indicators){
      const functionName = indicator.functionName
      allCandles[interval] = await indicatorService[functionName](allCandles[interval], ...indicator.params)
    }
  }
  return allCandles
}

module.exports = {
  highest,
  lowest,
  candleProcessed,
  applyIndicators,
};
