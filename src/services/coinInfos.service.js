const exchangeInfos = require('../../static/exchange.json');
const {Spot} = require('@binance/connector');
const config = require('../config/config');
const requestManager = require('../utils/requestManager');

const getAllPrice = async () => {
  const prices = await requestManager.safeRequest("binance",'fetchTickers', [])
  return Object.values(prices);
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
}
