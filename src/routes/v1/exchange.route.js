const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const exchangeValidation = require('../../validations/exchange.validation');
const exchangeController = require('../../controllers/exchange.controller');

const router = express.Router();

router.route('/rankedtokens').get(auth('rankedtokens'), exchangeController.getRankedTokens);
router.route('/account').get(auth('account'), exchangeController.getAccount);
router.route('/account/:asset').get(auth('asset'), exchangeController.getAsset);
router.route('/time').get(auth('time'), exchangeController.getBinanceTime);

router
  .route('/:pair')
  .get(auth('getHistoricalData'), validate(exchangeValidation.getHistoricalData), exchangeController.getHistoricalData);

router.route('/pair/order').post(auth('newOrder'), validate(exchangeValidation.newOrder), exchangeController.newOrder);

router.route('/pair/backtest').get(auth('backTest'), validate(exchangeValidation.backTest), exchangeController.backTest);

router
  .route('/pair/livetrading')
  .post(auth('livetrading'), validate(exchangeValidation.liveTrading), exchangeController.liveTrading);



router
  .route('/pair/sockettrading')
  .post(auth('sockettrading'), validate(exchangeValidation.socketTrading), exchangeController.socketTrading);

module.exports = router;
