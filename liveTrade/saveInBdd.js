const axios = require('axios');
const tokenList = require('../static/tokenList.json');
const dataManager = require('../src/utils/dataManager');

const launch = async () => {
  const exchangeInfos = await axios.get('http://localhost:3000/v1/exchange/exchangeinfos')
  let rankedTokens = await axios.get('http://localhost:3000/v1/exchange/rankedtokens')
  rankedTokens = rankedTokens.data.result

  rankedTokens = [
    {"pair": "BTCUSDT", "asset1": "BTC", "asset2": "USDT"},
    {"pair": "ETHUSDT", "asset1": "ETH", "asset2": "USDT"},
    {"pair": "BNBUSDT", "asset1": "BNB", "asset2": "USDT"},
    {"pair": "ADAUSDT", "asset1": "ADA", "asset2": "USDT"},
    {"pair": "XRPUSDT", "asset1": "XRP", "asset2": "USDT"},
    {"pair": "SOLUSDT", "asset1": "SOL", "asset2": "USDT"},
    {"pair": "DOTUSDT", "asset1": "DOT", "asset2": "USDT"},
  ]


  const params = {
    interval: '1d',
    limit: '1000',
    realTrading: "1",
    signals: '0',
    formatIndex: '1',
    //strategy: 'multiIntervalStrategy',
    strategy: 'superTrendStrategy',
    startTime: "01-05-2021 00:00",
    endTime: "22-10-2021 02:00",
    candleFusion: "1",
    buyAtStart: "0",
    minimumProfit: "30",
    saveInBdd: "1"
  }
  const actualCoins = []
  const backTestAll = axios.post('http://localhost:3000/v1/exchange/pair/tradeBestTokens', {data: rankedTokens, params, actualCoins})

}


launch().then(() => {
  console.log("launched");

});

