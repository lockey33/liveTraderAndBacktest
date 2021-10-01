const requestManager = require('../utils/requestManager');
const exchangeInfos = require('../../static/exchange.json');

const getAccount = async () => {
  const options = {recvWindow: 60000}
  const account = await requestManager.safeRequest("account", [options]);
  return account.data;
};

const checkPosition = async(params, requirements, inPosition = "0", lastPrice) => {
  if (params.signals !== "1") {
    const pairBalance = await getPairBalance({asset1: params.asset1, asset2: params.asset2});
    let minNotional =  lastPrice * pairBalance.asset1.free
    console.log(minNotional, requirements)
    if (pairBalance.asset1.free > requirements.minQty && minNotional > requirements.minNotional) {
      inPosition = "1";
      console.log("IN POSITION")
    }
    //console.log(pairBalance, requirements, inPosition, lastPrice)

    return { inPosition: inPosition, pairBalance: pairBalance }
  }
}

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
  checkPosition,
  getPairBalance,
  getAccount,
  getAsset,
  getPairInfos,
};
