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

const manageBlackList = (blackList, rankedTokens) => {
  blackList.map((blackListed) => {
    rankedTokens.map((coin, index) => {
      //console.log(blackListed)
      if(coin.pair === blackListed){
        rankedTokens.splice(index, 1)
      }
    })
  })


  return rankedTokens
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
  manageBlackList,
  highest,
  lowest,
  candleProcessed,
  applyIndicators,
};
