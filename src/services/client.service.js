const ccxt = require('ccxt')
const config = require('../config/config');


const getClient = async(exchange) => {

  const clientForExchange = new ccxt[exchange]({apiKey: config.exchange.binance.apiKey, secret: config.exchange.binance.apiSecret, enableRateLimit: true});

  return clientForExchange
}


module.exports = {
  getClient
}
