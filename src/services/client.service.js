const {Spot} = require('@binance/connector');
const config = require('../config/config');

class Client {

  constructor() {
    this.client = new Spot(config.exchange.binance.apiKey, config.exchange.binance.apiSecret);
  }

}

class Singleton {

  constructor() {
    if (!Singleton.instance) {
      Singleton.instance = new Client();
    }
  }

  getInstance() {
    return Singleton.instance;
  }

}

module.exports = Singleton;
