const fs = require('fs');
const path = require('path');
const moment = require('moment');
const appDir = path.resolve('./');
const calculate = require('./calculate');

const writeLogs = (fileName, content) => {
  console.log(fileName, content)
  const filePath = `${appDir}/logs/${fileName}.txt`;
  const data = moment().format('DD-MM HH:m') + ' ' + content.toString() + '\n';
  fs.writeFile(filePath, data, { flag: 'a+' }, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

const logBuyAndSell = (type, candle, amount, newPairBalance) => {
  if(type === "BUY"){
    console.log(
      candle.openTime,
      type,
      amount,
      newPairBalance.asset1.asset,
      'with',
      newPairBalance.asset2.free,
      newPairBalance.asset2.asset
    );
  }else{
    console.log(
      candle.openTime,
      type,
      newPairBalance.asset1.free,
      newPairBalance.asset1.asset,
      'for',
      newPairBalance.asset2.free,
      newPairBalance.asset2.asset
    );
  }

}

const showResults = (initialPairBalance, newPairBalance) => {
  newPairBalance = calculate.calculateProfit(initialPairBalance, newPairBalance);
  let numberWin = calculate.winningTrades(newPairBalance.trades)
  newPairBalance.totalTrades = newPairBalance.trades.length / 2
  newPairBalance.wonTrades = numberWin
  newPairBalance.loseTrades = newPairBalance.totalTrades - newPairBalance.wonTrades;
  newPairBalance.tradeWinRate = ((newPairBalance.wonTrades / newPairBalance.totalTrades) * 100).toFixed(2)
  newPairBalance = calculate.avgResults(newPairBalance)
  console.log('Profit :', newPairBalance.profit, '%', 'Won trades :', numberWin, '/', newPairBalance.trades.length / 2, 'Win rate:', newPairBalance.tradeWinRate, '%');
  return newPairBalance
}

module.exports = {
  writeLogs,
  showResults,
  logBuyAndSell,
};
