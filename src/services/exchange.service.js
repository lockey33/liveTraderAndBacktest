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

const client = new Spot(config.exchange.binance.apiKey, config.exchange.binance.apiSecret);

const getHistoricalData = async (params) => {
  const pair = await dataFormater.getPair(params);
  let candles = []
  params.startTime = (params.startTime ? await dataFormater.formatDate(params.startTime) : null)
  params.endTime = (params.endTime ? await dataFormater.formatDate(params.endTime) : null)

  //console.log(checkPosition)
  if(params.interval.includes("_")){
    let intervals = params.interval.split("_")

    for(const interval of intervals){
      if(params.candleFusion === '1'){
        candles[interval] = await getCandlesUntilDate(params, pair, interval)
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
      for(const interval of intervals){
        await listenToSocket(pair, params, dataWithIndicators, interval)
      }
    }else{
      await listenToSocket(pair, params, dataWithIndicators, params.interval)
    }


  }catch(err){
    console.log('ICIIIIII', err)
  }
  return "Socket launched";
}

const listenToSocket = async (pair, params, dataWithIndicators, interval) => {
  const socket = new WebSocket('wss://stream.binance.com:9443/ws/'+pair+'@kline_'+ interval);
  params.i = 1;
  let intervals = Object.keys(dataWithIndicators)
  socket.onmessage = async(event) => {
    let data = JSON.parse(event.data);
    if (data.k.x === true) {
      console.log("candle closed", moment().format('DD-MM HH:mm'), pair.toUpperCase());
      params.closeCandle = 1
      const results = await manageLastCandle(dataWithIndicators, params, data, interval)
      dataWithIndicators[interval] = results.candles
      params = results.params
      const previousCandle = dataWithIndicators[interval][dataWithIndicators[interval].length - 2]
      const currentCandle = dataWithIndicators[interval][dataWithIndicators[interval].length - 1]
      const currentUpperTrend = dataWithIndicators[intervals[0]][dataWithIndicators[intervals[0]].length - 1]
      console.log( pair.toUpperCase(), "position", params.inPosition, "previousTrend", previousCandle.supertrend, "currentTrend", currentCandle.supertrend, "currentUpperTrend", currentUpperTrend.supertrend)
      //console.table(dataWithIndicators[interval],['openTime', 'open', 'closeTime', 'close', 'supertrend']);
      //console.log(dataWithIndicators[interval][dataWithIndicators[interval].length - 1].openTime, dataWithIndicators[interval][dataWithIndicators[interval].length - 1].supertrend)
    } else {
      //console.log("waiting close");
      const results = await manageLastCandle(dataWithIndicators, params, data, interval)
      //console.table(dataWithIndicators["1m"],['openTime', 'open', 'closeTime', 'close', 'supertrend']);
      dataWithIndicators[interval] = results.candles
      params = results.params
    }
  }
}


const manageLastCandle = async (dataWithIndicators, params, actualCandle, interval) => {

  const formatedCandle = await dataFormater.formatSocketCandle(actualCandle);
  const candles = dataWithIndicators[interval]

  if(formatedCandle.openTime !== candles[candles.length - 1].openTime){
    candles.push(formatedCandle)
  }else if(formatedCandle.openTime === candles[candles.length - 1].openTime && candles[candles.length - 1].liveCandle){
    candles[candles.length - 1] = formatedCandle
  }
  else{
    formatedCandle.liveCandle = 1;
    candles[candles.length - 1] = formatedCandle
  }

  dataWithIndicators = await strategy[params.strategy](dataWithIndicators, params);
  //console.table(candles,['openTime', 'open', 'closeTime', 'close', 'supertrend']);

  return { candles: candles, params: dataWithIndicators.params }
}

const eraseLastCandle = (candles) => {
  if(candles[candles.length - 1].liveCandle === 1){
    candles.splice(candles.length - 1, 1);
  }
}

//  TODO CRON tous les jours sur cette fonction (attention au path)
const getExchangeInfos = async () => {
  try {
    let infos = await axios.get('https://www.binance.com/api/v1/exchangeInfo');
    infos = infos.data.symbols;
    const exchangeFile = `${appDir}/static/exchange.json`;
    fs.writeFile(exchangeFile, JSON.stringify(infos), { flag: 'a+' }, (err) => {
      if (err) {
        console.error(err);
      }
    });
  } catch (err) {
    console.log(err);
    return 'error while fetching exchange infos';
  }
};



const getBinanceTime = async (data) => {
  const time = client.time();
  return time;
}


module.exports = {
  getHistoricalData,
  getSocketData,
  getExchangeInfos,
  getBinanceTime,
  manageLastCandle,
  eraseLastCandle
};
