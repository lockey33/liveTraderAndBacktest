#!/bin/bash
pm2 stop all
kill $(lsof -t -i:3000)
npm start
sleep 10
cd liveTrade
node tradeBestTokens.js
#node tradeAllCoins.js

