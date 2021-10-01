const calculateProfit = (initialPairBalance, newPairBalance) => {
  let asset2Pourcentage = parseFloat(initialPairBalance.asset2.free) - parseFloat(newPairBalance.asset2.free);
  asset2Pourcentage = (Math.abs(asset2Pourcentage) / initialPairBalance.asset2.free) * 100;
  // eslint-disable-next-line no-param-reassign
  newPairBalance.profit = asset2Pourcentage.toFixed(2);
  if (newPairBalance.asset2.free < initialPairBalance.asset2.free) {
    // eslint-disable-next-line no-param-reassign
    newPairBalance.profit = (-Math.abs(newPairBalance.profit)).toFixed(2);
  }

  return newPairBalance;
};

const calculateDifference = (oldValue, newValue) => {
  let formatedNumber1 = parseFloat(oldValue)
  let formatedNumber2 = parseFloat(newValue)
  let pourcentage = formatedNumber1 - formatedNumber2
  pourcentage = (Math.abs(pourcentage) / formatedNumber1) * 100
  pourcentage = pourcentage.toFixed(2)

  if(formatedNumber1 > formatedNumber2){
    pourcentage = (-Math.abs(pourcentage)).toFixed(2);
  }

  return pourcentage
}

const winningTrades = (trades) => {
  let numberWin = 0;
  trades.map((trade) => {
    if(trade.winningTrade){
      numberWin++;
    }
  })
  return numberWin
};

const avgResults = (balance) => {
  let totalProfit = 0
  let totalLose = 0

  balance.trades.map((trade) => {
    if(trade.hasOwnProperty("profit") && trade.profit !== undefined){
      if(!trade.winningTrade){
        totalLose += (trade.previousProfit ? parseFloat(trade.previousProfit) - parseFloat(trade.profit) : parseFloat(trade.profit))
      }else{
        totalProfit += (trade.previousProfit ? Math.abs(parseFloat(trade.previousProfit) - parseFloat(trade.profit)) : parseFloat(trade.profit))
      }
    }
  })
  balance.totalLose = totalLose
  balance.totalProfit = totalProfit
  balance.avgLose = (totalLose / balance.loseTrades).toFixed(2)
  balance.avgProfit = (totalProfit / balance.wonTrades).toFixed(2)
  balance.riskReward = '1:' + (balance.avgProfit / balance.avgLose).toFixed(1);
  return balance
}

module.exports = {
  calculateProfit,
  calculateDifference,
  winningTrades,
  avgResults,
};
