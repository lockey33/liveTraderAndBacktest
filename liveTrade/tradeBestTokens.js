const axios = require('axios');
const fs = require('fs');
const path = require('path');
const appDir = path.resolve('./');
const tokenList = require('../static/tokenList.json');
const dataManager = require('../src/utils/dataManager');

const launch = async () => {
  let rankedTokens = await axios.get('http://localhost:3000/v1/exchange/rankedtokens')
  rankedTokens = rankedTokens.data.result

  let actualCoins = await axios.get('http://localhost:3000/v1/exchange/getActualCoins')
  actualCoins = actualCoins.data
  rankedTokens.push({"pair": "ILVUSDT", asset1: "ILV", asset1: "ILV", asset2: "USDT"})
  //let rankedTokens = tokenList
  const blackList = ["PERPUSDT", "KLAYUSDT"]
  rankedTokens = dataManager.manageBlackList(blackList, rankedTokens)
  //console.dir(rankedTokens, {'maxArrayLength': null})
  const customCoins = [
    {"asset1": "BTC", "interval": "4h_1h", "skipTest": true},
    {"asset1": "ETH", "interval": "4h_1h", "skipTest": true},
    {"asset1": "FTM", "interval": "30m_15m", "skipTest": true},
    ]
  rankedTokens = rankedTokens.slice(0,100)
  //console.table(rankedTokens)


  const params = {
    interval: '8h_4h',
    limit: '1000',
    realTrading: "1",
    signals: '0',
    formatIndex: '1',
    strategy: 'multiIntervalStrategy',
    //strategy: 'superTrendStrategy',
    startTime: "01-05-2021 00:00",
    endTime: "18-10-2021 10:00",
    candleFusion: "1",
    buyAtStart: "0",
    minimumProfit: "30"
  }
  const backTestAll = axios.post('http://localhost:3000/v1/exchange/pair/tradeBestTokens', {data: rankedTokens, params, customCoins, actualCoins})

}


launch().then(() => {
  console.log("launched");

});

