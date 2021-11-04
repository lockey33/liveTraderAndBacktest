const exchangeInfos = require('../../static/exchange.json');
const {Spot} = require('@binance/connector');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const appDir = path.resolve('./');
const axios = require('axios');
const client = new Spot(config.exchange.binance.apiKey, config.exchange.binance.apiSecret);

const getExchangeInfos = async () => {
  try {
    let infos = await axios.get('https://www.binance.com/api/v1/exchangeInfo');
    infos = infos.data.symbols;
    const exchangeFile = `${appDir}/static/exchange.json`;
    fs.truncate(exchangeFile, 0, (err) => {
      if (err) {
        console.error(err);
      }
    })

    fs.writeFile(exchangeFile, JSON.stringify(infos), { flag: 'a+' }, (err) => {
      if (err) {
        console.error(err);
      }
    })

  } catch (err) {
    console.log(err);
    return 'error while fetching exchange infos';
  }
};

const getAllPrice = async () => {
  console.log("getAllPrice")
  const prices = await client.tickerPrice();
  return prices.data;
};

const getPairInfos = async (pair) => {
  let data = {};
  exchangeInfos.map((pairData) => {
    if (pairData.symbol === pair) {
      data = pairData;
    }
  });

  return data;
};

const getRequirements = async (pair) => {
  const pairInfos = await getPairInfos(pair);
  let requirements = null;

  pairInfos.filters.map((filter) => {
    if (filter.filterType === 'LOT_SIZE') {
      requirements = filter;
      requirements.minQty = parseFloat(requirements.minQty);
      requirements.stepSize = parseFloat(requirements.stepSize);
    }
    if (filter.filterType === "MIN_NOTIONAL") {
      if (requirements !== null) {
        requirements.minNotional = parseFloat(filter.minNotional)
      } else {
        requirements = filter;
        requirements.minNotional = parseFloat(requirements.minNotional)
      }
    }
  });
  return requirements;
}


module.exports = {
  getPairInfos,
  getAllPrice,
  getRequirements,
  getExchangeInfos
}
