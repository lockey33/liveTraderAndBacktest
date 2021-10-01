const { Spot } = require('@binance/connector');
const logsManager = require('../utils/logsManager');
const exchange = require('./exchange.service');
const wallet = require('./wallet.service');
const config = require('../config/config');
const dataFormater = require('./dataFormat.service');
const client = new Spot(config.exchange.binance.apiKey, config.exchange.binance.apiSecret);

const getPrice = async (pair) => {
  const price = await client.tickerPrice(pair);
  return parseFloat(price.data.price);
};

const getRequirements = async(pair) =>{
  const pairInfos = await wallet.getPairInfos(pair);
  let requirements = null;
  pairInfos.filters.map((filter) => {
    if (filter.filterType === 'LOT_SIZE') {
      requirements = filter;
      requirements.minQty = parseFloat(requirements.minQty);
      requirements.stepSize = parseFloat(requirements.stepSize);
    }
    if(filter.filterType === "MIN_NOTIONAL"){
      if(requirements !== null){
        requirements.minNotional = parseFloat(filter.minNotional)
      }else{
        requirements = filter;
        requirements.minNotional = parseFloat(requirements.minNotional)
      }
    }
  });
  return requirements;
}



const getOrderValue = async (side, pairBalance, price, pair) => {
  const buyPourcentage = 0.2;
  const sellPourcentage = 1;

  let orderValue = null;
  let requirements =  await getRequirements(pair);
  const decimalPosition = requirements.stepSize.toString().indexOf('1');

  if (side.toUpperCase() === 'BUY') {
    orderValue = (pairBalance.asset2.free * buyPourcentage) / price; // 104 * 0.2 = 52 / 404 = 0.12
    orderValue = parseFloat(orderValue);
    orderValue = ((orderValue + requirements.stepSize / 2) / requirements.stepSize) * requirements.stepSize;
    orderValue = dataFormater.fixedNumber(orderValue, decimalPosition - 1);
  } else if (side.toUpperCase() === 'SELL') {
    orderValue = price * pairBalance.asset1.free * sellPourcentage;
    orderValue /= price;
    console.log(orderValue, requirements.stepSize);
    orderValue = ((orderValue - requirements.stepSize / 2) / requirements.stepSize) * requirements.stepSize;
    orderValue = dataFormater.truncateDecimals(orderValue, decimalPosition - 1);
  }

  if (orderValue < parseFloat(requirements.minQty)) {
    const fileName = `${pairBalance.asset1.asset}${pairBalance.asset2.asset}`;
    logsManager.writeLogs(fileName, 'Not enough tokens to make order');
  }

  return orderValue;
};


const newOrder = async (data) => {
  console.log("newOrder")
  console.log(data);
  const pair = data.asset1 + data.asset2;
  const fileName = pair;
  try {
    const pairBalance = await wallet.getPairBalance({ asset1: data.asset1, asset2: data.asset2 });
    const price = await getPrice(pair);
    const orderValue = await getOrderValue(data.side, pairBalance, price, pair);
    const options = { quantity: orderValue, recvWindow: 60000 };
    const order = await client.newOrder(pair, data.side, data.type, options);
    logsManager.writeLogs(fileName, `${data.side} ${orderValue} ${data.asset1}`);
    // return 'ok';
    return order.data;
  } catch (err) {
    console.log(err);
    console.log(err.response.data);
    logsManager.writeLogs(fileName, `${err.response.data.msg.toString()}`);
    return err.response.data;
  }
};

module.exports = {
  getOrderValue,
  getRequirements,
  newOrder,
};
