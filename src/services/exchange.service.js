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
const telegram = require('../services/telegram.service');
const requestManager = require('../utils/requestManager');

const client = new Spot(config.exchange.binance.apiKey, config.exchange.binance.apiSecret);

const getHistoricalData = async (params) => {
  console.log(params);
  const pair = await dataFormater.getPair(params);
  let candles = await requestManager.safeRequest("klines", [pair, params.interval, {startTime: params.startTime, limit: params.limit} ]);
  candles = candles.data;
  if (params.formatIndex === '1' || params.form) {
    candles = await dataFormater.formatAllCandles(candles);
  }

  //TODO voir sur le long terme si le pop est rentable
  candles.pop(); //suppression de la bougie en cours car on ne veux que les bougies déjà cloturées

  return candles;
};

const getSocketData = async (params, candles) => {
  try{
    let pair = await dataFormater.getPair(params);
    pair = pair.toLowerCase()
    let dataWithIndicators = await strategy[params.strategy](candles, params);
    dataWithIndicators = dataWithIndicators.candles;
    const socket = new WebSocket('wss://stream.binance.com:9443/ws/'+pair+'@kline_'+params.interval);
    socket.onmessage = async(event) => {
      let data = JSON.parse(event.data);
      if (data.k.x === true) {
        console.log("candle closed", moment().format('DD-MM HH:mm'), pair.toUpperCase());
        const results = await manageLastCandle(dataWithIndicators, params, data)
        dataWithIndicators = results.candles
        params = results.params
        //console.table(dataWithIndicators,['openTime', 'open', 'closeTime', 'close', 'supertrend', 'candleProcessed']);
      } else {
        //console.log("waiting close");
        const results = await manageLastCandle(dataWithIndicators, params, data)
        dataWithIndicators = results.candles
        params = results.params
        //console.table(dataWithIndicators,['openTime', 'open', 'closeTime', 'close', 'supertrend', 'candleProcessed']);
        //console.log(params)
        //console.log(moment(data.k.t).format('DD-MM HH:m'))
        //console.log(moment(data.k.T).format('DD-MM HH:m'))
      }
    }
  }catch(err){
    console.log('ICIIIIII', err)
  }
  return "Socket launched";
}


const manageLastCandle = async (dataWithIndicators, params, actualCandle) => {
  //TODO il manque une bougie et il faut faire en sorte de remplacer les bougies lives par les bougies de cloture
  const formatedCandle = await dataFormater.formatSocketCandle(actualCandle);
  //console.log(dataWithIndicators)
  if(formatedCandle.openTime !== dataWithIndicators[dataWithIndicators.length - 1].openTime){
    dataWithIndicators.push(formatedCandle)
  }else if(formatedCandle.openTime === dataWithIndicators[dataWithIndicators.length - 1].openTime && dataWithIndicators[dataWithIndicators.length - 1].liveCandle){
    dataWithIndicators[dataWithIndicators.length - 1] = formatedCandle
  }
  else{
    formatedCandle.liveCandle = 1;
    dataWithIndicators[dataWithIndicators.length - 1] = formatedCandle
  }

  dataWithIndicators = await strategy[params.strategy](dataWithIndicators, params);

  return { candles: dataWithIndicators.candles, params: dataWithIndicators.params }
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
