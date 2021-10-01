const { Spot } = require('@binance/connector');
const config = require('../config/config');
const requestManager = require('../utils/requestManager');
const exchangeInfos = require('../../static/exchange.json');

const getAccount = async () => {
  const options = {recvWindow: 60000}
  const account = await requestManager.safeRequest("account", [options]);
  return account.data;
};

const getAsset = async (assetName) => {
  const account = await getAccount();
  let response = null;
  account.balances.map((coinInfos) => {
    if (coinInfos.asset === assetName) {
      response = coinInfos;
      response.free = parseFloat(coinInfos.free);
      response.locked = parseFloat(coinInfos.locked);
    }
  });
  return response;
};

const getPairBalance = async (assets) => {
  const asset1 = await getAsset(assets.asset1);
  const asset2 = await getAsset(assets.asset2);
  const assetsBalance = { asset1, asset2 };
  return assetsBalance;
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

module.exports = {
  getPairBalance,
  getAccount,
  getAsset,
  getPairInfos,
};
