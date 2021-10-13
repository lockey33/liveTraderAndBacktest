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
  req.body.realTrading = "0"

  let backTestResults = []
  let finalCapital = 0;
  let initialCapital = 50 * coinList.length;

  for(const coin of coinList){
    let filteredResult = await exchange.backTest(coin)
    finalCapital += filteredResult.amount
    backTestResults.push(filteredResult)
  }
  let finalProfit = calculate.calculateDifference(initialCapital, finalCapital)

  let globalWinRate = 0
  let averageLose = 0
  let averageProfit = 0

  backTestResults.map((result) => {
    globalWinRate += parseFloat(result.winRate)
    averageLose += parseFloat(result.avgLose)
    averageProfit += parseFloat(result.avgProfit)
  })
  const coinNumbers = backTestResults.length
  globalWinRate = globalWinRate / coinNumbers
  averageLose =  averageLose / coinNumbers
  averageProfit =  averageProfit / coinNumbers

  backTestResults.sort(function (a, b) {
    return b.profit - a.profit;
  });
  console.table(backTestResults)
  console.log("Profit total", finalProfit, "%")
  console.log("WinRate Global", globalWinRate + "%")
  console.log("Average Lose", averageLose + "%")
  console.log("Average Profit", averageProfit + "%")
  console.log("Final :", finalCapital)
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
  liveTrading,
  socketTrading,
  getBinanceTime,
  newOrder,
  getRankedTokens,
  getAllPrice,
  getActualCoins,
  getExchangeInfos,
};
