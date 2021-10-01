const highest = (array) => {
  return Math.max.apply(Math, array);
};

const lowest = (array) => {
  return Math.min.apply(Math, array);
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

const candleProcessed = (data, index) => {
  data[index].candleProcessed = 1;
  return data
}

module.exports = {
  highest,
  lowest,
  manageEmptyRow,
  candleProcessed
};
