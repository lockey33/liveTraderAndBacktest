const PairSchema = require('../models/pair.model.js');
const moment = require('moment');
const checkIfPairExist = async (pair) => {
  let foundPair = await PairSchema.findOne({"pair": pair})
  if (foundPair == null) {
    return false
  } else {
    return true // la paire n'existe pas
  }
}

const savePairInBdd = async (data, params) => {
  console.log('savePair')
  try{
    let backTest = []


    if(!data.pair){
      data.pair = data.asset1 + data.asset2
    }

    if(data.hasOwnProperty("amount") || data.hasOwnProperty("winRate")){
      backTest = JSON.parse(JSON.stringify(data))
      backTest.startTime = params.startTime
      backTest.endTime = params.endTime
      backTest.startDate = moment(params.startTime).format( 'DD-MM-YYYY hh:mm')
      backTest.endDate =  moment(params.endTime).format( 'DD-MM-YYYY hh:mm')
      backTest.strategy = params.strategy
      delete backTest.asset1
      delete backTest.asset2
      delete backTest.pair
    }

    const pairAlreadyExist = await checkIfPairExist(data.pair)

    if(!pairAlreadyExist){
      let pairObject = {
        pair: data.pair,
        asset1: data.asset1,
        asset2: data.asset2,
        backTests: []
      }
      pairObject.backTests.push(backTest)
      const pair = new PairSchema(pairObject)
      pair.markModified('backTests');
      await pair.save()
    }else{
      await PairSchema.updateOne(
        {"pair": data.pair},
        {
          $push: {
            backTests: backTest,
          }
        })
    }

  }catch(err){
    console.log(err)
  }
}


module.exports = {
  savePairInBdd,
}
