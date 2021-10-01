const catchAsync = require('../utils/catchAsync');
const exchange = require('../services/exchange.service');
const wallet = require('../services/wallet.service');
const order = require('../services/order.service');
const strategy = require('../services/strategy.service');
const backTesting = require('../services/backTesting.service');
const discover = require('../services/discover.service');
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

module.exports = {
  getAccount,
  getAsset,
  getHistoricalData,
  backTest,
  liveTrading,
  socketTrading,
  getBinanceTime,
  newOrder,
  getRankedTokens,
};
