const axios = require('axios');
const fs = require('fs');
const path = require('path');
const appDir = path.resolve('./');

const launch = async () => {
  const exchangeInfos = await axios.get('http://localhost:3000/v1/exchange/exchangeinfos')
  //let rankedTokens = await axios.get('http://localhost:3000/v1/exchange/rankedtokens')
  let actualCoins = await axios.get('http://localhost:3000/v1/exchange/getActualCoins')
  actualCoins = actualCoins.data
  //rankedTokens = rankedTokens.data.result
  //rankedTokens = rankedTokens.slice(0,100)
  let rankedTokens =
    [
      {pair: 'BNBUSDT', asset1: 'BNB', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'ADAUSDT', asset1: 'ADA', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'XRPUSDT', asset1: 'XRP', asset2: 'USDT'},
      {pair: 'SOLUSDT', asset1: 'SOL', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'DOTUSDT', asset1: 'DOT', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'DOGEUSDT', asset1: 'DOGE', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'LUNAUSDT', asset1: 'LUNA', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'UNIUSDT', asset1: 'UNI', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'AVAXUSDT', asset1: 'AVAX', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'LTCUSDT', asset1: 'LTC', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'LINKUSDT', asset1: 'LINK', asset2: 'USDT'},
      {pair: 'SHIBUSDT', asset1: 'SHIB', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'BCHUSDT', asset1: 'BCH', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'ALGOUSDT', asset1: 'ALGO', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'MATICUSDT', asset1: 'MATIC', asset2: 'USDT', 'customPourcentage': '0.3'},
      {pair: 'XLMUSDT', asset1: 'XLM', asset2: 'USDT', 'customPourcentage': '0.3'},
    ]
  const blackList = ["PERPUSDT", "RAREUSDT", "REQUSDT", "UMAUSDT", "SUSHIUSDT", "XECUSDT", "XEMUSDT", "FLOWUSDT", "BTCSTUSDT", "SHIBUSDT"]
  const customInterval = "4h_1h";

  for(const actualCoin of actualCoins){
    let found = false

    rankedTokens.map((coin, index) => {
      if(coin.pair === actualCoin.pair){
        found = true
      }
      if(blackList.includes(coin.pair)){
        rankedTokens.splice(index, 1)
      }
    })
    if(!found){
      rankedTokens.push(actualCoin)
    }
  }


  for (const token of rankedTokens) {
    const params = {
      interval: '1m',
      limit: '1000',
      realTrading: "1",
      signals: '0',
      formatIndex: '1',
      asset1: token.asset1,
      asset2: token.asset2,
      strategy: 'superTrendStrategy',
      oneOrderSignalPassed : "1",
      customPourcentage: token.customPourcentage
    }

/*    if(token.asset1 === "BTC" || token.asset1 === "ETH"){
      params.interval = customInterval
    }*/

    const liveSignal = await axios.post('http://localhost:3000/v1/exchange/pair/sockettrading', params)
  }
}


launch().then(() => {
    console.log("launched");

  });

