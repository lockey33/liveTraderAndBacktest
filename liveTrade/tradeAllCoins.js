const axios = require('axios');
const fs = require('fs');
const path = require('path');
const appDir = path.resolve('./');

const launch = async () => {
  const exchangeInfos = await axios.get('http://localhost:3000/v1/exchange/exchangeinfos')
  let rankedTokens = await axios.get('http://localhost:3000/v1/exchange/rankedtokens')
  rankedTokens = rankedTokens.data.result


  for (const token of rankedTokens) {
    const params = {
      interval: '1h',
      limit: '1000',
      realTrading: "0",
      signals: '1',
      formatIndex: '1',
      asset1: token.asset1,
      asset2: token.asset2,
      strategy: 'ichimokuStrategy',
      oneOrderSignalPassed : "1",
    }


    const liveSignal = await axios.post('http://localhost:3000/v1/exchange/pair/sockettrading', params)
  }
}


launch().then(() => {
    console.log("launched");

  });

