const coinInfos = require('./coinInfos.service');
const requestManager = require('../utils/requestManager');

const getAccount = async () => {
  const options = {recvWindow: 60000}
  const account = await requestManager.safeRequest("fetchBalance");
  return account.info;
};

const checkPosition = async(params, requirements, inPosition = "0", lastPrice) => {
  let pair = params.asset1 + params.asset2
  pair = pair.toUpperCase()
  if (params.signals !== "1") {
    const pairBalance = await getPairBalance({asset1: params.asset1, asset2: params.asset2});

    let minNotional =  lastPrice * pairBalance.asset1.free
    if (pairBalance.asset1.free > requirements.minQty && minNotional > requirements.minNotional) {
      inPosition = "1";
      console.log("IN POSITION" , pair, params.interval)
    }else{
      inPosition = params.inPosition
    }
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


const getActualCoins = async() => {
  const prices = await coinInfos.getAllPrice();
  let account = await getAccount();
  let balances = account.balances

  let allTokens = []
  for(const balance of balances){
    balance.pair = balance.asset + "USDT";
  }
  for(const price of prices){
    for(const balance of balances){
      if(balance.pair === price.symbol){
        let newObject = balance
        newObject.price = price.last
        allTokens.push(newObject)
      }
    }
  }
  let tokenInPosition = []
  //console.log(allTokens)
  for(const token of allTokens){
    let minNotional =  token.price * token.free
    let requirements = await coinInfos.getRequirements(token.pair);
    if(!token.asset.includes("BUSD")){
      if (token.free > requirements.minQty && minNotional > requirements.minNotional) {
        tokenInPosition.push({pair: token.pair,asset1: token.asset, asset2: "USDT", inPosition: true} )
      }
    }
  }
  return tokenInPosition;
}



module.exports = {
  getActualCoins,
  checkPosition,
  getPairBalance,
  getAccount,
  getAsset,
};
