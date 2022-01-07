#!/bin/bash
pm2 stop all
kill $(lsof -t -i:3000)
pkill node
#sleep 2
#pm2 start ../nodeFinder/
#sleep 2
npm start
sleep 30
cd liveTrade
#node tradeCustomTokens.js
sleep 30
node tradeBestTokens.js
node tradeAllCoins.js



