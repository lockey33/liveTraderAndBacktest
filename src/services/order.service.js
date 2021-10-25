const {Spot} = require('@binance/connector');
const logsManager = require('../utils/logsManager');
const coinInfos = require('./coinInfos.service');
const wallet = require('./wallet.service');
const config = require('../config/config');
const dataFormater = require('./dataFormat.service');
const telegram = require('./telegram.service');
console.log(config.exchange.binance)
const client = new Spot(config.exchange.binance.apiKey, config.exchange.binance.apiSecret);

const getPrice = async (pair) => {
  const price = await client.tickerPrice(pair);
  return parseFloat(price.data.price);
};


const getOrderValue = async (side, pairBalance, price, pair, params) => {
  const buyPourcentage = (params.customPourcentage ? parseFloat(params.customPourcentage) : 0.1);
  const sellPourcentage = 1;

  let orderValue = null;
  let requirements = await coinInfos.getRequirements(pair);
  const decimalPosition = requirements.stepSize.toString().indexOf('1');
  let results = {}

  if (side.toUpperCase() === 'BUY') {
    orderValue = (pairBalance.asset2.free * buyPourcentage) / price; // 104 * 0.2 = 52 / 404 = 0.12
    orderValue = parseFloat(orderValue);
    orderValue = ((orderValue + requirements.stepSize / 2) / requirements.stepSize) * requirements.stepSize;
    orderValue = dataFormater.fixedNumber(orderValue, decimalPosition - 1);
  } else if (side.toUpperCase() === 'SELL') {
    orderValue = price * pairBalance.asset1.free * sellPourcentage;
    orderValue /= price;
    orderValue = ((orderValue - requirements.stepSize / 2) / requirements.stepSize) * requirements.stepSize;
    orderValue = dataFormater.truncateDecimals(orderValue, decimalPosition - 1);
  }

  if (orderValue < parseFloat(requirements.minQty)) {
    const fileName = `${pairBalance.asset1.asset}${pairBalance.asset2.asset}`;
    logsManager.writeLogs(fileName, 'Not enough tokens to make order');
    results.err = "minQty"

  }
  const tradeAmount = price * orderValue
  if (parseFloat(tradeAmount) < parseFloat(requirements.minNotional)) {
    const fileName = `${pairBalance.asset1.asset}${pairBalance.asset2.asset}`;
    console.log("minNotional")
    logsManager.writeLogs(fileName, 'minNotional');
    results.err = "minNotional"
  }
  results.orderValue = orderValue
  console.log("return OrderValue")
  return results;
};


const newOrder = async (orderParams, globalParams) => {
  const pair = globalParams.asset1 + globalParams.asset2;
  const fileName = pair;

  try {
    //await telegram.sendMessage(orderParams.side + " " + pair)
    const pairBalance = await wallet.getPairBalance({asset1: globalParams.asset1, asset2: globalParams.asset2});
    const price = await getPrice(pair);
    const orderObject = await getOrderValue(orderParams.side, pairBalance, price, pair, globalParams);
    console.log(pair, orderObject.orderValue)
    if (!orderObject.err) {

      const options = {quantity: orderObject.orderValue, recvWindow: 60000};
      const orderRes = await client.newOrder(pair, orderParams.side, orderParams.type, options);
      console.log(orderRes)
      logsManager.writeLogs(fileName, `${orderParams.side} ${orderObject.orderValue} ${globalParams.asset1}`);
      await telegram.sendMessage(orderParams.side.toUpperCase() + " " + pair.toUpperCase())

    } else {
      await telegram.sendMessage(orderParams.side.toUpperCase() + " error : " + orderObject.err.toString() + " " + pair.toUpperCase())
    }

  } catch (err) {
    console.log(err);
    await telegram.sendMessage(err.toString())
    logsManager.writeLogs(fileName, `${err.response.data.msg.toString()}`);
  }

  return globalParams;

};


const getAllOrders = async(pair) => {
  let orders = await client.allOrders(pair)
  orders = orders.data
  console.log(orders)
  return orders
}



module.exports = {
  getAllOrders,
  getOrderValue,
  newOrder,
};
