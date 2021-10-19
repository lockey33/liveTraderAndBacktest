#!/bin/bash
forever stopall
kill $(lsof -t -i:3000)
forever start -c "npm run dev" ./
sleep 10
cd liveTrade
node tradeBestTokens.js
#node tradeAllCoins.js
