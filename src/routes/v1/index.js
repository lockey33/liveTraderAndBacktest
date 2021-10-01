const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const exchangeRouge = require('./exchange.route');
const config = require('../../config/config');
const logger = require('../../config/logger');
const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/exchange',
    route: exchangeRouge,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  logger.info('development mode');
}

module.exports = router;
