const exchangeInfos = require('../../static/exchange.json');
const axios = require('axios');
const tokenList = require('../../static/tokenList.json');

const getLatestCoinMarketCap = async() => {
  const apiKey = 'ac8ce2bb-5321-47a7-915f-c672af08819e';
  let results = null;
  try{
    results = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?CMC_PRO_API_KEY=ac8ce2bb-5321-47a7-915f-c672af08819e&start=1&limit=10')
    results = results.data.data;

    let filtered = []

    results.map((result) => {
      if(!(result.tags.indexOf('stablecoin') > -1) && result.symbol.includes('DOWN') === false && result.symbol.includes('UP') === false){
        filtered.push(result)
      }
    })
    results = filtered
    return results;

    //console.log(filtered)
  }catch(err){
    //console.log(err)
    return [];
  }
}

const getTradable = async(coinMarketCapList, binanceList) => {
  const tradableList = [];

  coinMarketCapList.map((coinMarketCapCurrency) => {
    const coinMarketCapPair = coinMarketCapCurrency.symbol + "USDT";
    binanceList.map((binanceCurrency) => {
      if(binanceCurrency.symbol === coinMarketCapPair && binanceCurrency.status === "TRADING"){
        const currencyObject = {pair: binanceCurrency.symbol, asset1: binanceCurrency.baseAsset, asset2: binanceCurrency.quoteAsset}
        tradableList.push(currencyObject)
      }
    })
  })
  return tradableList
}

const getRankedTokens = async (data) => {
  const coinMarketCapList = await getLatestCoinMarketCap();
  const binanceList = exchangeInfos;
  const tradableList = await getTradable(coinMarketCapList, binanceList)

  return tradableList;
}

module.exports = {
  getLatestCoinMarketCap,
  getRankedTokens,
}
