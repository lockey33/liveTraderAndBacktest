const { Spot } = require('@binance/connector');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const WebSocket = require('ws');
const moment = require('moment');
const appDir = path.resolve('./');
const dataFormater = require('./dataFormat.service');
const strategy = require('../services/strategy.service');
const config = require('../config/config');
const requestManager = require('../utils/requestManager');
const wallet = require('../services/wallet.service');
const order = require('../services/order.service');
const backTesting = require('../services/backTesting.service');

const client = new Spot(config.exchange.binance.apiKey, config.exchange.binance.apiSecret);

const getHistoricalData = async (params) => {
  const pair = await dataFormater.getPair(params);
  let candles = []
  params.startTime = (params.startTime ? await dataFormater.formatDate(params.startTime) : null)
  params.endTime = (params.endTime ? await dataFormater.formatDate(params.endTime) : null)
  params.inPosition = "0";
  if(params.interval.includes("_")){
    let intervals = params.interval.split("_")

    for(const interval of intervals){
      if(params.candleFusion === '1'){
          let newParams = JSON.parse(JSON.stringify(params))
          //newParams.startTime = moment(params.startTime).subtract(400, "days")
          //newParams.startTime = moment(newParams.startTime).valueOf()
          candles[interval] = await getCandlesUntilDate(newParams, pair, interval)
      }else{
        candles[interval] = await requestManager.safeRequest("klines", [pair, interval, {startTime: params.startTime, limit: params.limit} ]);
        candles[interval] = candles[interval].data
        candles[interval] = await dataFormater.formatAllCandles(candles[interval]);
        if(!params.realTrading) {
          const requirements = await order.getRequirements(params.asset1+params.asset2)
          const checkPosition = await wallet.checkPosition(params, requirements, "0", candles[interval][candles[interval].length - 1].close)
          params.inPosition = checkPosition.inPosition
          params.pairBalance = checkPosition.pairBalance
        }
      }
    }
  }else{
    if(params.candleFusion === '1'){
      candles[params.interval] = await getCandlesUntilDate(params, pair, params.interval)
    }else{
      candles[params.interval] = await requestManager.safeRequest("klines", [pair, params.interval, {startTime: params.startTime, limit: params.limit} ]);
      candles[params.interval] = candles[params.interval].data;
      candles[params.interval] = await dataFormater.formatAllCandles(candles[params.interval]);
      if(!params.realTrading){
        const requirements = await order.getRequirements(params.asset1+params.asset2)
        const checkPosition = await wallet.checkPosition(params, requirements, "0", candles[params.interval][candles[params.interval].length - 1].close)
        params.inPosition = checkPosition.inPosition
        params.pairBalance = checkPosition.pairBalance
      }

    }

  }


  return candles;

};

const getCandlesUntilDate = async (params, pair, interval) => {
  let candles = await requestManager.safeRequest("klines", [pair, interval, {startTime: params.startTime, limit: params.limit} ]);
  candles = candles.data
  candles = await dataFormater.formatAllCandles(candles);
  let lastDate = candles[candles.length - 1].openTime
  lastDate = moment(lastDate, "DD-MM-YYYY hh:mm")
  let lastTime = moment(lastDate).valueOf()
  let requiredDate = moment(params.endTime)
  while(!moment(lastDate).isSameOrAfter(moment(requiredDate))){
    let newCandles = await requestManager.safeRequest("klines", [pair, interval, {startTime: lastTime, limit: params.limit} ]);
    newCandles = newCandles.data
    newCandles = await dataFormater.formatAllCandles(newCandles);
    candles.pop()
    candles = candles.concat(newCandles)

    lastDate = candles[candles.length - 1].openTime
    lastDate = moment(lastDate, "DD-MM-YYYY hh:mm")
    lastTime = moment(lastDate).valueOf()
    //console.log(moment(lastDate).format("DD-MM-YYYY hh:mm"))
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
  console.log("Listening to :", pair.toUpperCase(), targetInterval)
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
  if(params.waitForClose === "1"){
    const formatedCandle = await dataFormater.formatSocketCandle(actualCandle);
    if(formatedCandle.openTime !== candles[candles.length - 1].openTime){ //si la dernière candle a une date différente de la nouvelle, on push
      console.log("candle closed", formatedCandle.openTime, formatedCandle.closeTime, params.pair)
      candles.push(formatedCandle)
      dataWithIndicators = await strategy[params.strategy](dataWithIndicators, params, targetInterval);
      candles = dataWithIndicators.candles[targetInterval]
      params = dataWithIndicators.params
      //console.log(params)
    }
  }else{
    if(params.i % parseInt(params.spacing) === 0){

      const formatedCandle = await dataFormater.formatSocketCandle(actualCandle);

      if(formatedCandle.openTime !== candles[candles.length - 1].openTime){ //si la dernière candle a une date différente de la nouvelle, on push
        console.log("candle closed", formatedCandle.openTime, formatedCandle.closeTime, params.pair)
        candles.push(formatedCandle)

      }else{ // si l'heure est identique
        candles[candles.length - 1] = formatedCandle
        dataWithIndicators = await strategy[params.strategy](dataWithIndicators, params, targetInterval);
        candles = dataWithIndicators.candles[targetInterval]
        params = dataWithIndicators.params

      }
    }
  }



  return { candles, params }

}

const getExchangeInfos = async () => {
  try {
    let infos = await axios.get('https://www.binance.com/api/v1/exchangeInfo');
    infos = infos.data.symbols;
    const exchangeFile = `${appDir}/static/exchange.json`;
    fs.truncate(exchangeFile, 0, (err) => {
      if (err) {
        console.error(err);
      }
    })

    fs.writeFile(exchangeFile, JSON.stringify(infos), { flag: 'a+' }, (err) => {
      if (err) {
        console.error(err);
      }
    })

  } catch (err) {
    console.log(err);
    return 'error while fetching exchange infos';
  }
};



const getBinanceTime = async (data) => {
  const time = client.time();
  return time;
}


const backTest = async (coin) => {
  const candles = await getHistoricalData(coin);
  console.log(candles)
  const results = await backTesting[coin.strategy](candles, coin);
  const pair = results.asset1.asset + results.asset2.asset;
  let filteredResults = {pair: pair, profit: results.profit, amount: results.asset2.free, winRate: results.tradeWinRate, riskReward: results.riskReward, totalLose: results.totalLose.toFixed(2), totalProfit: results.totalProfit.toFixed(2), avgLose: results.avgLose, avgProfit: results.avgProfit}

  return filteredResults

}


module.exports = {
  getHistoricalData,
  getSocketData,
  getExchangeInfos,
  getBinanceTime,
  manageLastCandle,
  backTest,
};
