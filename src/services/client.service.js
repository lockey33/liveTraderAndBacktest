const ccxt = require('ccxt')
const config = require('../config/config');


const binance = new ccxt.binance({apiKey: config.exchange.binance.apiKey, secret: config.exchange.binance.apiSecret, enableRateLimit: true});

module.exports = {
  binance
}
