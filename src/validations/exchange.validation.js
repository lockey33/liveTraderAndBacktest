const Joi = require('joi');

const getAsset = {
  params: Joi.object().keys({
    asset: Joi.string().required(),
  }),
};

const getHistoricalData = {
  params: Joi.object().keys({
    pair: Joi.string().required(),
  }),
  body: Joi.object().keys({
    interval: Joi.string().required(),
    limit: Joi.string(),
    formatIndex: Joi.string().required(),
  }),
};

const backTest = {
  body: Joi.object().keys({
    interval: Joi.string().required(),
    limit: Joi.string(),
    formatIndex: Joi.string().required(),
    formatDate: Joi.string(),
    asset1: Joi.string().required(),
    asset2: Joi.string().required(),
    asset1Balance: Joi.string(),
    asset2Balance: Joi.string(),
    signals: Joi.string().required(),
    strategy: Joi.string().required(),
    startTime: Joi.string(),
    endTime: Joi.string(),
    stopLoss: Joi.string(),
  }),
};

const liveTrading = {
  body: Joi.object().keys({
    interval: Joi.string().required(),
    limit: Joi.string(),
    formatIndex: Joi.string().required(),
    formatDate: Joi.string(),
    asset1: Joi.string().required(),
    asset2: Joi.string().required(),
    asset1Balance: Joi.string(),
    asset2Balance: Joi.string(),
    signals: Joi.string().required(),
    strategy: Joi.string().required(),
  }),
};

const socketTrading = {
  body: Joi.object().keys({
    interval: Joi.string().required(),
    limit: Joi.string(),
    formatIndex: Joi.string().required(),
    formatDate: Joi.string(),
    asset1: Joi.string().required(),
    asset2: Joi.string().required(),
    asset1Balance: Joi.string(),
    asset2Balance: Joi.string(),
    signals: Joi.string().required(),
    strategy: Joi.string().required(),
  }),
};

const newOrder = {
  body: Joi.object().keys({
    asset1: Joi.string().required(),
    asset2: Joi.string().required(),
    side: Joi.string().required(),
    type: Joi.string().required(),
    quantity: Joi.string(),
  }),
};

module.exports = {
  getAsset,
  getHistoricalData,
  backTest,
  liveTrading,
  socketTrading,
  newOrder,
};
