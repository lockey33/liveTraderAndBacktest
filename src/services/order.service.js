const {Spot} = require('@binance/connector');
const logsManager = require('../utils/logsManager');
const exchange = require('./exchange.service');
const wallet = require('./wallet.service');
const config = require('../config/config');
const dataFormater = require('./dataFormat.service');
const telegram = require('./telegram.service');
const client = new Spot(config.exchange.binance.apiKey, config.exchange.binance.apiSecret);

const getPrice = async (pair) => {
  const price = await client.tickerPrice(pair);
  return parseFloat(price.data.price);
};

const getAllPrice = async () => {
  const prices = await client.tickerPrice();
  return prices.data;
};

const getRequirements = async (pair) => {
  const pairInfos = await wallet.getPairInfos(pair);
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


const getOrderValue = async (side, pairBalance, price, pair) => {
  const buyPourcentage = 0.1;
  const sellPourcentage = 1;

  let orderValue = null;
  let requirements = await getRequirements(pair);
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

  return results;
};


const newOrder = async (orderParams, globalParams) => {
  const pair = globalParams.asset1 + globalParams.asset2;
  const fileName = pair;

  try {
    const pairBalance = await wallet.getPairBalance({asset1: globalParams.asset1, asset2: globalParams.asset2});
    const price = await getPrice(pair);
    const orderObject = await getOrderValue(orderParams.side, pairBalance, price, pair);
    if (!orderObject.err) {

      const options = {quantity: orderObject.orderValue, recvWindow: 60000};

      if (orderParams.side === "BUY" && globalParams.inPosition === "0") {
        await client.newOrder(pair, orderParams.side, orderParams.type, options);
      } else if (orderParams.side === "SELL" && globalParams.inPosition === "1") {
        await client.newOrder(pair, orderParams.side, orderParams.type, options);
      }
      logsManager.writeLogs(fileName, `${orderParams.side} ${orderObject.orderValue} ${globalParams.asset1}`);
      await telegram.sendMessage(orderParams.side.toUpperCase() + " " + pair.toUpperCase())

    } else {
      await telegram.sendMessage("Order error : " + orderObject.err.toString() + " " + pair.toUpperCase())
    }

  } catch (err) {
    console.log(err);
    await telegram.sendMessage(err.toString())
    logsManager.writeLogs(fileName, `${err.response.data.msg.toString()}`);
  }

  return globalParams;

};

module.exports = {
  getAllPrice,
  getOrderValue,
  getRequirements,
  newOrder,
};
