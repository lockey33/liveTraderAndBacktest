const axios = require('axios');
const fs = require('fs');
const path = require('path');
const appDir = path.resolve('./');

const launch = async () => {
  let rankedTokens = [
      {asset1: "RARE", asset2: "USDT", interval:  '5m_1m'},
    ]
  for (const token of rankedTokens) {
    const params = {
      interval: token.interval,
      limit: '400',
      realTrading: "1",
      formatIndex: '1',
      asset1: token.asset1,
      asset2: token.asset2,
      signals: '0',
      strategy: 'multiIntervalStrategy',
      oneOrderSignalPassed : "1",
    }
    const liveSignal = await axios.post('http://localhost:3000/v1/exchange/pair/sockettrading', params)
  }
}


launch().then(() => {
    console.log("launched");

  });

