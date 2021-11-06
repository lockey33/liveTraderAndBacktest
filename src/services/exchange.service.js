const { Spot } = require('@binance/connector');

const WebSocket = require('ws');
const moment = require('moment');

const dataFormater = require('./dataFormat.service');
const strategy = require('../services/strategy.service');
const config = require('../config/config');
const requestManager = require('../utils/requestManager');
const wallet = require('../services/wallet.service');
const order = require('../services/order.service');
const backTesting = require('../services/backTesting.service');
const calculate = require('../utils/calculate');
const coinInfos = require('../services/coinInfos.service');
const database = require('../services/database.service');

const client = new Spot(config.exchange.binance.apiKey, config.exchange.binance.apiSecret);

const getLimitedCandles = async (params, pair, interval) => {
  let candles = []
  candles[interval] = await requestManager.safeRequest("klines", [pair, interval, {startTime: params.startTime, limit: params.limit} ]);
  candles[interval] = candles[interval].data
  candles[interval] = await dataFormater.formatAllCandles(candles[interval]);
  if(!params.realTrading) {
    const requirements = await coinInfos.getRequirements(params.asset1 + params.asset2)
    const checkPosition = await wallet.checkPosition(params, requirements, "0", candles[interval][candles[interval].length - 1].close)
    params.inPosition = checkPosition.inPosition
    params.pairBalance = checkPosition.pairBalance
  }

  candles[interval].pop()

  return candles[interval]
}

const candlesManager = async(params, pair, interval) => {
  let candlesForInterval = [];

  if(params.candleFusion === '1'){
    candlesForInterval = await getCandlesUntilDate(params, pair, interval)
  }else{
    candlesForInterval = await getLimitedCandles(params,pair, interval)
  }
  return candlesForInterval
}

const getHistoricalData = async (params) => {
  const pair = await dataFormater.getPair(params);
  let candles = []
  params.startTime = (params.startTime ? await dataFormater.formatDate(params.startTime) : null)
  params.endTime = (params.endTime ? await dataFormater.formatDate(params.endTime) : null)
  params.inPosition = "0";

  if(params.interval.includes("_")){ // si on est en multi interval
    let intervals = params.interval.split("_")

    for(const interval of intervals){
      candles[interval] = await candlesManager(params, pair, interval)
    }

  }else { // mono interval
    candles[params.interval] = await candlesManager(params, pair, params.interval)
  }
  return candles;

};

const getCandlesUntilDate = async (params, pair, interval) => {
  let candles = await requestManager.safeRequest("klines", [pair, interval, {startTime: params.startTime, limit: params.limit} ]);
  candles = candles.data
  candles = await dataFormater.formatAllCandles(candles);
  let startDate = moment(params.startTime)
  let lastDate = candles[candles.length - 1].openTime

  lastDate = moment(lastDate, "DD-MM-YYYY hh:mm")
  let lastTime = moment(lastDate).valueOf()
  let requiredDate = moment(params.endTime)

  while(!moment(lastDate).isSameOrAfter(moment(requiredDate)) && moment(lastDate).isBetween(moment(startDate), moment(requiredDate))){
    let newCandles = await requestManager.safeRequest("klines", [pair, interval, {startTime: lastTime, limit: params.limit} ]);
    newCandles = newCandles.data
    newCandles = await dataFormater.formatAllCandles(newCandles);
    candles.pop()
    candles = candles.concat(newCandles)

    lastDate = candles[candles.length - 1].openTime
    lastDate = moment(lastDate, "DD-MM-YYYY hh:mm")
    lastTime = moment(lastDate).valueOf()
    console.log(moment(lastDate).format("DD-MM-YYYY hh:mm"))
  }
  return candles
}



const getSocketData = async (params, candles) => {
  try{
    let pair = await dataFormater.getPair(params);
    pair = pair.toLowerCase()
    let dataWithIndicators = candles;
    if(params.interval.includes("_")){
      let intervals = params.interval.split("_")
      params.lowestInterval = intervals[intervals.length - 1] // 5m
      for(const targetInterval of intervals){
        await listenToSocket(pair, params, dataWithIndicators, targetInterval)
      }
    }else{
      await listenToSocket(pair, params, dataWithIndicators, params.interval)
    }


  }catch(err){
    console.log('ICIIIIII', err)
  }
  return "Socket launched";
}

const listenToSocket = async (pair, params, dataWithIndicators, targetInterval) => {
  const socket = new WebSocket('wss://stream.binance.com:9443/ws/'+pair+'@kline_'+ targetInterval);
  params.i = 0;
  params.pair = pair.toUpperCase()
  dataWithIndicators[targetInterval][dataWithIndicators[targetInterval].length - 1].liveCandle = "1"
  console.log("Listening to :", pair.toUpperCase(), targetInterval, "real :", params.realTrading, "signals :", params.signals, "oneOrderSignalPassed", params.oneOrderSignalPassed)
  socket.onmessage = async(event) => {
    let data = JSON.parse(event.data);
    const results = await manageLastCandle(dataWithIndicators, params, data, targetInterval)
    dataWithIndicators[targetInterval] = results.candles
    params = results.params
  }
}


const manageLastCandle = async (dataWithIndicators, params, actualCandle, targetInterval) => {

  let candles = dataWithIndicators[targetInterval]
  if(targetInterval === params.lowestInterval){
    params.i = params.i + 1
  }
  //console.log(params.i, targetInterval)
  const formatedCandle = await dataFormater.formatSocketCandle(actualCandle);

  if(actualCandle.k.x === true){
    console.log("candle closed", formatedCandle.openTime, formatedCandle.closeTime, params.pair)

    candles.push(formatedCandle)
    dataWithIndicators = await strategy[params.strategy](dataWithIndicators, params, targetInterval);
    candles = dataWithIndicators.candles[targetInterval]
    //console.table(candles,['openTime', 'open', 'closeTime', 'close', 'supertrend', 'lowerband', 'upperband']);
    params = dataWithIndicators.params
    const fileName = `${params.asset1}${params.asset2}`;
    //logsManager.writeLogs(fileName, JSON.stringify(candles));
  }/*else{
    candles[candles.length - 1] = formatedCandle
    dataWithIndicators = await strategy[params.strategy](dataWithIndicators, params, targetInterval);
    candles = dataWithIndicators.candles[targetInterval]
    //console.table(candles,['openTime', 'open', 'closeTime', 'close', 'supertrend', 'lowerband', 'upperband']);
    params = dataWithIndicators.params
    //const fileName = `${params.asset1}${params.asset2}`;
    //logsManager.writeLogs(fileName, JSON.stringify(candles));
  }*/

  return { candles, params }

}

const getBinanceTime = async (data) => {
  const time = client.time();
  return time;
}


const backTest = async (coin) => {
  const candles = await getHistoricalData(coin);
  const results = await backTesting[coin.strategy](candles, coin);
  const pair = results.asset1.asset + results.asset2.asset;
  let filteredResults = {asset1: results.asset1.asset, asset2: results.asset2.asset, pair: pair, profit: results.profit, amount: results.asset2.free,best: results.best, winRate: results.tradeWinRate, minimumWinRate: results.minimumWinRate, totalLose: results.totalLose.toFixed(2), totalProfit: results.totalProfit.toFixed(2), avgLose: results.avgLose, avgProfit: results.avgProfit}
  if(coin.saveInBdd === "1"){
    await database.savePairInBdd(filteredResults, coin)
  }
  return filteredResults

}

const getAllBackTestResults = async (coinList, params) => {

  let backTestResults = []
  let finalCapital = 0;
  let initialCapital = 50 * coinList.length;

  for(const coin of coinList){
    const uniqueParams = JSON.parse(JSON.stringify(params))
    console.log(params)
    uniqueParams.asset1 = coin.asset1
    uniqueParams.asset2 = coin.asset2
    if(coin.skipTest === true){
      let object = {asset1: coin.asset1, asset2: coin.asset2, pair: coin.asset1 + coin.asset2, profit: "100", amount: 100,best: "1", winRate: "100", minimumWinRate: "0", totalLose: "0", totalProfit: "0", avgLose: "0", avgProfit: "0"}
      backTestResults.push(object)
    }else{
      let filteredResult = await backTest(uniqueParams)
      finalCapital += filteredResult.amount
      backTestResults.push(filteredResult)
    }
  }
  let finalProfit = calculate.calculateDifference(initialCapital, finalCapital)

  let globalWinRate = 0
  let averageLose = 0
  let averageProfit = 0

  backTestResults.map((result) => {
    globalWinRate += parseFloat(result.winRate)
    averageLose += parseFloat(result.avgLose)
    averageProfit += parseFloat(result.avgProfit)
  })
  const coinNumbers = backTestResults.length
  globalWinRate = globalWinRate / coinNumbers
  averageLose =  averageLose / coinNumbers
  averageProfit =  averageProfit / coinNumbers

  backTestResults.sort(function (a, b) {
    return b.profit - a.profit;
  });
  console.table(backTestResults)
  console.log("Initial capital", initialCapital)
  console.log("Profit total", finalProfit, "%")
  console.log("WinRate Global", globalWinRate + "%")
  console.log("Average Lose", averageLose + "%")
  console.log("Average Profit", averageProfit + "%")
  console.log("Final :", finalCapital)




  return backTestResults
}



const getBestTokens = async(tokens, params) => {
  let backTestResults = await getAllBackTestResults(tokens, params)

  let bestTokens = []
  console.log('here')
  console.table(backTestResults)
  for(result of backTestResults){

    if(parseFloat(result.profit) > params.minimumProfit && result.best === "1"){
      bestTokens.push(result)
    }else{
      if(result.inPosition === true){
        await order.newOrder({side: "SELL", type: "MARKET"}, {asset1: result.asset1, asset2: result.asset2, inPosition: "1"})
      }
    }
  }
  let finalCapital = 0;
  let initialCapital = 50 * bestTokens.length;
  let globalWinRate = 0;

  let bestPairs = []

  bestTokens.map((token) => {
    bestPairs.push(token.pair)
    finalCapital += parseFloat(token.amount)
    globalWinRate += parseFloat(token.winRate)
  })
  globalWinRate = globalWinRate / bestTokens.length

  let finalProfit = calculate.calculateDifference(initialCapital, finalCapital)

  console.log("Initial capital", initialCapital)
  console.log("Profit total", finalProfit, "%")
  console.log("WinRate Global", globalWinRate + "%")
  console.log("Final :", finalCapital)

  return bestTokens
}





module.exports = {
  getAllBackTestResults,
  getBestTokens,
  getHistoricalData,
  getSocketData,
  getBinanceTime,
  manageLastCandle,
  backTest,
};
