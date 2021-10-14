const axios = require('axios');
const fs = require('fs');
const path = require('path');
const appDir = path.resolve('./');
const tokenList = require('../static/tokenList.json');
const dataManager = require('../src/utils/dataManager');

const launch = async () => {
  const exchangeInfos = await axios.get('http://localhost:3000/v1/exchange/exchangeinfos')
  //let rankedTokens = await axios.get('http://localhost:3000/v1/exchange/rankedtokens')
  //rankedTokens = rankedTokens.data.result
  //rankedTokens = rankedTokens.slice(0,100)

  let actualCoins = await axios.get('http://localhost:3000/v1/exchange/getActualCoins')
  actualCoins = actualCoins.data

  let rankedTokens = tokenList
  //const blackList = ["PERPUSDT", "RAREUSDT", "REQUSDT", "UMAUSDT", "SUSHIUSDT", "XECUSDT", "XEMUSDT", "FLOWUSDT", "BTCSTUSDT"]
  const customCoins = [{"asset1": "BTC", "interval": "4h_1h"}, {"asset1": "ETH", "interval": "4h_1h"}]
  //rankedTokens = dataManager.manageBlackList(blackList, actualCoins, rankedTokens)
  rankedTokens = rankedTokens.slice(1,50)

  const params = {
    interval: '5m_1m',
    limit: '1000',
    realTrading: "0",
    signals: '1',
    formatIndex: '1',
    strategy: 'multiIntervalStrategy',
    startTime: "12-10-2021 00:00",
    endTime: "12-10-2021 2:00",
    candleFusion: "1",
    buyAtStart: "0",
    minimumProfit: "0.5"
  }
  const backTestAll = await axios.post('http://localhost:3000/v1/exchange/pair/tradeBestTokens', {data: rankedTokens, params, customCoins})

}


launch().then(() => {
  console.log("launched");

});

