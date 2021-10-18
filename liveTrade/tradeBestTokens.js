const axios = require('axios');
const fs = require('fs');
const path = require('path');
const appDir = path.resolve('./');
const tokenList = require('../static/tokenList.json');
const dataManager = require('../src/utils/dataManager');

const launch = async () => {
  const exchangeInfos = await axios.get('http://localhost:3000/v1/exchange/exchangeinfos')
  let rankedTokens = await axios.get('http://localhost:3000/v1/exchange/rankedtokens')
  rankedTokens = rankedTokens.data.result

  let actualCoins = await axios.get('http://localhost:3000/v1/exchange/getActualCoins')
  actualCoins = actualCoins.data

  //let rankedTokens = tokenList
  //const blackList = ["PERPUSDT", "RAREUSDT", "REQUSDT", "UMAUSDT", "SUSHIUSDT", "XECUSDT", "XEMUSDT", "FLOWUSDT", "BTCSTUSDT"]
  const customCoins = [{"asset1": "BTC", "interval": "4h_1h"}, {"asset1": "ETH", "interval": "4h_1h"}]
  //rankedTokens = dataManager.manageBlackList(blackList, actualCoins, rankedTokens)
  rankedTokens = rankedTokens.slice(1,50)



  const params = {
    interval: '8h_2h',
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

