const axios = require('axios');
const tokenList = require('../static/tokenList.json');
const dataManager = require('../src/utils/dataManager');

const launch = async () => {
  const exchangeInfos = await axios.get('http://localhost:3000/v1/exchange/exchangeinfos')
  let rankedTokens = await axios.get('http://localhost:3000/v1/exchange/rankedtokens')
  rankedTokens = rankedTokens.data.result

  let actualCoins = await axios.get('http://localhost:3000/v1/exchange/getActualCoins')
  actualCoins = actualCoins.data
  //let rankedTokens = []
  if(rankedTokens.length === 0){
    rankedTokens = tokenList
  }
  const blackList = ["PERPUSDT", "KLAYUSDT", "BTCUSDT", "STXUSDT", "ETHUSDT", "FTMUSDT", "SHIBUSDT"]
  rankedTokens = await dataManager.manageBlackList(blackList, rankedTokens)

  //console.dir(rankedTokens, {'maxArrayLength': null})
  rankedTokens = rankedTokens.slice(0,50)

  const params = {
    interval: '8h_4h',
    limit: '200',
    realTrading: "1",
    signals: '0',
    formatIndex: '1',
    strategy: 'multiIntervalStrategy',
    //strategy: 'superTrendStrategy',
    startTime: "20-10-2021 00:00",
    endTime: "03-11-2021 14:00",
    candleFusion: "1",
    buyAtStart: "0",
    minimumProfit: "30",
  }
  const backTestAll = axios.post('http://localhost:3000/v1/exchange/pair/tradeBestTokens', {data: rankedTokens, params, actualCoins})

}


launch().then(() => {
  console.log("launched");

});

