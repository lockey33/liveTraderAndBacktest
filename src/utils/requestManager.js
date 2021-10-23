const axios = require("axios");
const config = require('../config/config');
const client = require('../services/client.service')

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


const safeRequest = async (exchanges, functionName, params) => {
  try{
    const clientForExchange = await client.getClient("binance")
    const response = await clientForExchange[functionName](...params);
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
