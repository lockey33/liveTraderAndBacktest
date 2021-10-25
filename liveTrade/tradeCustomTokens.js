const axios = require('axios');
const fs = require('fs');
const path = require('path');
const appDir = path.resolve('./');

const launch = async () => {

  const customCoins = [
    {"asset1": "BTC", asset2: "USDT", "interval": "4h_1h", "skipTest": true, "customPourcentage": "0.3"},
    {"asset1": "STX", asset2: "USDT", "interval": "8h_2h", "skipTest": true},
    {"asset1": "ETH", asset2: "USDT", "interval": "4h_1h", "skipTest": true, "customPourcentage": "0.3"},
    {"asset1": "FTM", asset2: "USDT", "interval": "30m_15m", "skipTest": true, "customPourcentage": "0.5"},
  ]

  for (const token of customCoins) {
    const params = {
      interval: "1m",
      limit: '1000',
      realTrading: "1",
      signals: '0',
      formatIndex: '1',
      asset1: token.asset1,
      asset2: token.asset2,
      strategy: 'multiIntervalStrategy',
      oneOrderSignalPassed : "1",
      customPourcentage: token.customPourcentage
    }


    const liveSignal = await axios.post('http://localhost:3000/v1/exchange/pair/sockettrading', params)
  }
}


launch().then(() => {
    console.log("launched");

  });

