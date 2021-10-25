const axios = require('axios');
const tokenList = require('../static/tokenList.json');
const dataManager = require('../src/utils/dataManager');

const launch = async () => {
  const exchangeInfos = await axios.get('http://localhost:3000/v1/exchange/exchangeinfos')
  let rankedTokens = await axios.get('http://localhost:3000/v1/exchange/rankedtokens')
  rankedTokens = rankedTokens.data.result
  let actualCoins = await axios.get('http://localhost:3000/v1/exchange/getActualCoins')
  console.log(actualCoins)
  actualCoins = actualCoins.data

  if(rankedTokens.length === 0){
    rankedTokens = tokenList
  }
  rankedTokens.push({"pair": "ILVUSDT", asset1: "ILV", asset2: "USDT"})

  const blackList = ["PERPUSDT", "KLAYUSDT"]
  rankedTokens = await dataManager.manageBlackList(blackList, rankedTokens)
  //console.dir(rankedTokens, {'maxArrayLength': null})
  const customCoins = [
    {"asset1": "BTC", asset2: "USDT", "interval": "4h_1h", "skipTest": true},
    {"asset1": "STX", asset2: "USDT", "interval": "8h_2h", "skipTest": true},
    {"asset1": "ETH", asset2: "USDT", "interval": "4h_1h", "skipTest": true},
    {"asset1": "FTM", asset2: "USDT", "interval": "30m_15m", "skipTest": true},
    ]
  rankedTokens = rankedTokens.slice(0,50)

  const params = {
    interval: '30m',
    limit: '1000',
    realTrading: "0",
    signals: '1',
    formatIndex: '1',
    //strategy: 'multiIntervalStrategy',
    strategy: 'superTrendStrategy',
    startTime: "01-08-2021 00:00",
    endTime: "22-09-2021 02:00",
    candleFusion: "1",
    buyAtStart: "0",
    minimumProfit: "30"
  }
  const backTestAll = axios.post('http://localhost:3000/v1/exchange/pair/tradeBestTokens', {data: rankedTokens, params, customCoins, actualCoins})

}


launch().then(() => {
  console.log("launched");

});

