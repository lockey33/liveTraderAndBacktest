const axios = require('axios');

axios
  .post('http://localhost:3000/v1/exchange/pair/livetrading', {
    interval: '5m',
    limit: '300',
    formatIndex: '1',
    asset1: 'AAVE',
    asset2: 'USDT',
  })
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
