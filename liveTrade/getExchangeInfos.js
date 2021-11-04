const axios = require('axios');

const launch = async () => {
  const exchangeInfos = await axios.get('http://localhost:3000/v1/exchange/exchangeinfos')
}


launch().then(() => {
  console.log("launched");

});

