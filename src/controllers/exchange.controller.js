const catchAsync = require('../utils/catchAsync');
const exchange = require('../services/exchange.service');
const wallet = require('../services/wallet.service');
const order = require('../services/order.service');
const strategy = require('../services/strategy.service');
const backTesting = require('../services/backTesting.service');
const discover = require('../services/discover.service');
const calculate = require('../utils/calculate');
const coinInfos = require('../services/coinInfos.service');
const sleep = require('sleep');

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
  let coinList = req.body.data
  const params = req.body.params
  const actualCoins = req.body.actualCoins
  actualCoins.map((actualCoin) => {
    let foundCoin = false;
    coinList.map((coin) => {
      if(actualCoin.asset1 === coin.asset1){
        coin.inPosition = true
        foundCoin = true
      }
    })
    if(foundCoin === false){
      coinList.push(actualCoin)
    }
  })
  console.table(coinList)

  let bestTokens = await exchange.getBestTokens(coinList, params)

  for(const token of bestTokens) {
    let uniqueParams = JSON.parse(JSON.stringify(params))
    uniqueParams.asset1 = token.asset1
    uniqueParams.asset2 = token.asset2

    delete uniqueParams.startTime
    delete uniqueParams.endTime
    delete uniqueParams.candleFusion
    uniqueParams.oneOrderSignalPassed = "1"

    let candles = await exchange.getHistoricalData(uniqueParams);
    let intervals = Object.keys(candles);
    if(candles[intervals[0]].length > 20) {
      const socketData = await exchange.getSocketData(uniqueParams, candles)
    }
  }

  res.send("Smart trading launched")
})

const getAllOrders = catchAsync(async (req, res) => {
  try{
    const orders = await order.getAllOrders(req.body.pair);
    res.send({ orders });
  }catch(err){
    console.log(err);
    res.send({data: err});
  }
});


const getAllPrice = catchAsync(async (req, res) => {
  try{
    const prices = await coinInfos.getAllPrice();
    res.send({ prices });
  }catch(err){
    console.log(err);
    res.send({data: err});
  }
});

const getActualCoins = catchAsync(async (req, res) => {
  try{
    let tokenInPosition = await wallet.getActualCoins()
    //console.log(tokenInPosition.length)
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
      console.log("Not enough candles for now")
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
  const exchangeInfos = await coinInfos.getExchangeInfos()
  res.send({result: "Exchange scraped"})
})

module.exports = {
  getAccount,
  getAllOrders,
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
