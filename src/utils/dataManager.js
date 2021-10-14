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

const manageBlackList = (blackList, actualCoins, rankedTokens) => {
  for(const actualCoin of actualCoins){
    let found = false

    rankedTokens.map((coin, index) => {
      if(coin.pair === actualCoin.pair){
        found = true
      }
      if(blackList.includes(coin.pair)){
        rankedTokens.splice(index, 1)
      }
    })
    if(!found){
      rankedTokens.push(actualCoin)
    }
  }
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
