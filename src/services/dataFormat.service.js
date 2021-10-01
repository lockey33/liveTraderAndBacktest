/* eslint-disable dot-notation */
/* eslint-disable prefer-destructuring */
/* eslint-disable array-callback-return */
const moment = require('moment');

const fixedNumber = (num, fixed) => {
  const re = new RegExp(`^-?\\d+(?:\.\\d{0,${fixed || -1}})?`);
  return num.toString().match(re)[0];
};


const getPair = async(params) => {
  if(params.hasOwnProperty("pair")){
    return params.pair;
  }else{
    return params.asset1 + params.asset2;
  }
}

const truncateDecimals = (num, digits) => {
  const numS = num.toString();
  const decPos = numS.indexOf('.');
  const substrLength = decPos == -1 ? numS.length : 1 + decPos + digits;
  const trimmedResult = numS.substr(0, substrLength);
  const finalResult = isNaN(trimmedResult) ? 0 : trimmedResult;

  return parseFloat(finalResult);
};

const formatAllCandles = async (data) => {
  const newArray = [];
  data.map((candle) => {
    const newCandle = {};
    newCandle.openTime = moment(candle[0]).format('DD-MM-YYYY HH:mm');
    newCandle.open = candle[1];
    newCandle.high = candle[2];
    newCandle.low = candle[3];
    newCandle.close = candle[4];
    newCandle.volume = candle[5];
    newCandle.closeTime = moment(candle[6]).format('DD-MM-YYYY HH:mm');
    newArray.push(newCandle);
  });
  return newArray;
};

const formatSocketCandle = async (data) => {
  const candle = {
    openTime: moment(data.k.t).format('DD-MM-YYYY HH:mm'),
    open: data.k.o,
    high: data.k.h,
    low: data.k.l,
    close: data.k.l,
    volume: data.k.v,
    closeTime: moment(data.k.T).format('DD-MM-YYYY HH:mm')
  }
  return candle;
}

const talibFormat = async (data) => {
  const candleObject = { open: [], close: [], high: [], low: [] };
  if (Array.isArray(data)) {
    data.map((oneCandle) => {
      candleObject.open.push(oneCandle.open);
      candleObject.close.push(oneCandle.close);
      candleObject.high.push(oneCandle.high);
      candleObject.low.push(oneCandle.low);
    });
  } else {
    candleObject.open.push(data.open);
    candleObject.close.push(data.close);
    candleObject.high.push(data.high);
    candleObject.low.push(data.low);
  }
  return candleObject;
};

const convertAllToNumber = (data) => {
  const newArray = [];
  data.map((oneData) => {
    newArray.push(parseFloat(oneData));
  });
  return newArray;
};

const manageEmptyRow = (allData, columnName, columnData) => {
  const allDataLength = allData.length;
  const columnDataLength = columnData.length;
  if (allDataLength > columnDataLength) {
    const numberOfEmptyRow = allDataLength - columnDataLength;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < numberOfEmptyRow; i++) {
      columnData.unshift(NaN);
    }
  }
  return columnData;
};

formatDate = async(date) => {
 //let timestamp = moment(date, 'DD-MM-YYYY').add(2, 'hours')
  let timestamp = moment(date, 'DD-MM-YYYY hh:mm')
  timestamp = timestamp.valueOf()
  return timestamp
}

module.exports = {
  fixedNumber,
  truncateDecimals,
  convertAllToNumber,
  formatAllCandles,
  formatSocketCandle,
  talibFormat,
  getPair,
  manageEmptyRow,
  formatDate,
};
