const axios = require("axios");
const { Spot } = require('@binance/connector');
const config = require('../config/config');
const client = new Spot(config.exchange.binance.apiKey, config.exchange.binance.apiSecret);

const sleep = (milliseconds) => {
  console.log("sleeping", milliseconds)
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}


const getMillisToSleep =  (retryHeaderString) => {
  let millisToSleep = Math.round(parseFloat(retryHeaderString) * 1000)
  if (isNaN(millisToSleep)) {
    millisToSleep = Math.max(0, new Date(retryHeaderString) - new Date())
  }
  return millisToSleep
}


const safeRequest = async (functionName, params) => {
  try{
    const response = await client[functionName](...params)
    return response
  }catch(err){
    console.log(err)
    //console.log(err.response.status)
    const retryAfter = (err.response.status === 429 ? 20 : 300)
    if (err.response.status === 429 || err.response.status === 418) {
      console.log("retry", functionName)
      const millisToSleep = getMillisToSleep(retryAfter)
      await sleep(millisToSleep)
      return await safeRequest(functionName, params)
    }
  }
}




module.exports = {
  sleep,
  getMillisToSleep,
  safeRequest,

}
