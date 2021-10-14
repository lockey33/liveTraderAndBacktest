const catchAsync = require('../utils/catchAsync');
const exchange = require('../services/exchange.service');
const wallet = require('../services/wallet.service');
const order = require('../services/order.service');
const strategy = require('../services/strategy.service');
const backTesting = require('../services/backTesting.service');
const discover = require('../services/discover.service');
const calculate = require('../utils/calculate');
// const clientTest = new Spot(apiKey, apiSecret, { baseURL: 'https://testnet.binance.vision'});
const getAccount = catchAsync(async (req, res) => {
  const account = await wallet.getAccount();
  res.send(account);
});

const getAsset = catchAsync(async (req, res) => {
  const account = await wallet.getAsset(req.params.asset);
  res.send(account);
});

const getHistoricalData = catchAsync(async (req, res) => {
  const candles = await exchange.getHistoricalData(req.body);
  res.send(candles);
});


const getBinanceTime = catchAsync(async (req,res) => {
  const time = await exchange.getBinanceTime()
  res.send(time.data);
})

const backTest = catchAsync(async (req, res) => {
  try{
    req.body.realTrading = "0"
    const candles = await exchange.getHistoricalData(req.body);
    const results = await backTesting[req.body.strategy](candles, req.body);
    res.send({ data: results });

  }catch(err){
    console.log(err)
    res.send(err)

  }
});

const findBestParameters = catchAsync(async(req, res) => {
  const coinList = req.body.data
  const params = req.body.params

  let backTestResults = await exchange.getAllBackTestResults(coinList, params)
  res.send(backTestResults)

})


const liveTrading = catchAsync(async (req, res) => {
  try{
    const candles = await exchange.getHistoricalData(req.body);
    const results = await strategy[req.body.strategy](candles, req.body);
    res.send({ data: results });
  }catch(err){
    console.log(err);
    res.send({data: err});
  }
});

const tradeBestTokens = catchAsync(async(req, res) => {
  const coinList = req.body.data
  const params = req.body.params
  const customCoins = req.body.customCoins

  let bestTokens = await exchange.getBestTokens(coinList, params)

  for(const token of bestTokens) {
    let uniqueParams = JSON.parse(JSON.stringify(params))
    uniqueParams.asset1 = token.asset1
    uniqueParams.asset2 = token.asset2
    if(customCoins.some(c => c.asset1 === token.asset1)){
      let index = customCoins.map(e => e.asset1).indexOf(token.asset1);
      uniqueParams.interval = customCoins[index].interval
    }
    delete uniqueParams.startTime
    delete uniqueParams.endTime
    delete uniqueParams.candleFusion
    uniqueParams.oneOrderSignalPassed = "1"
    uniqueParams.waitForClose = "1"

    let candles = await exchange.getHistoricalData(uniqueParams);
    let intervals = Object.keys(candles);
    if(candles[intervals[0]].length > 20) {
      const socketData = await exchange.getSocketData(uniqueParams, candles)
    }
  }

  res.send("Smart trading launched")
})

const getAllPrice = catchAsync(async (req, res) => {
  try{
    const prices = await order.getAllPrice();
    res.send({ prices });
  }catch(err){
    console.log(err);
    res.send({data: err});
  }
});

const getActualCoins = catchAsync(async (req, res) => {
  try{
    const prices = await order.getAllPrice();
    let account = await wallet.getAccount();
    let balances = account.balances
    let allTokens = []
    for(const balance of balances){
      balance.pair = balance.asset + "USDT";
    }
    for(const price of prices){
      for(const balance of balances){
        if(balance.pair === price.symbol){
          let newObject = balance
          newObject.price = price.price
          allTokens.push(newObject)
        }
      }
    }
    let tokenInPosition = []
    //console.log(allTokens)
    for(const token of allTokens){
      let minNotional =  token.price * token.free
      let requirements = await order.getRequirements(token.pair);
      if(!token.asset.includes("BUSD")){
        if (token.free > requirements.minQty && minNotional > requirements.minNotional) {
          tokenInPosition.push({pair: token.pair,asset1: token.asset, asset2: "USDT"} )
        }
      }
    }
    //console.log(tokenInPosition)
    res.send(tokenInPosition);
  }catch(err){
    console.log(err);
    res.send({data: err});
  }
});

const socketTrading = catchAsync(async (req, res) => {
  try{
    let candles = await exchange.getHistoricalData(req.body);
    let intervals = Object.keys(candles);
    if(candles[intervals[0]].length > 20){
      const socketData = await exchange.getSocketData(req.body, candles)
      res.send({ data: socketData });
    }else{
      res.send({ data: "Not enough candles for now" });
    }
  }catch(err){
    console.log(err);
    res.send({data: err});
  }

});

const newOrder = catchAsync(async (req, res) => {
  const orderResponse = await order.newOrder(req.body);
  res.send({ result: orderResponse });
});

const getRankedTokens = catchAsync(async (req, res) => {
  const rankedTokens = await discover.getRankedTokens();
  res.send({result: rankedTokens});
})


const getExchangeInfos = catchAsync(async (req, res) => {
  const exchangeInfos = await exchange.getExchangeInfos()
  res.send({result: "Exchange scraped"})
})

module.exports = {
  getAccount,
  getAsset,
  getHistoricalData,
  backTest,
  findBestParameters,
  tradeBestTokens,
  liveTrading,
  socketTrading,
  getBinanceTime,
  newOrder,
  getRankedTokens,
  getAllPrice,
  getActualCoins,
  getExchangeInfos,
};
