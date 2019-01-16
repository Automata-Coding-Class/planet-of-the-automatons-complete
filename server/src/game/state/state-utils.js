const getRandomIntegerInRange = function (min, max) {
  if (min > max) {
    const temp = max;
    max = min;
    min = temp;
  }
  const rangeSize = max - min;
  if (rangeSize === 0) {
    return min;
  } else {
    return Math.floor(Math.random() * rangeSize) + min;
  }
};
module.exports.getRandomIntegerInRange = getRandomIntegerInRange;

const getRowAndColumnFromIndex = function (columns, index) {
  const r = Math.floor(index / columns);
  const c = index % columns;
  return {row: r, col: c};
};
module.exports.getRowAndColumnFromIndex = getRowAndColumnFromIndex;

module.exports.getIndexFromRowAndColumn = function(columns, row, col) {
  return row * columns + col;
};

module.exports.getRelativeIndex = function(index, rows, columns, direction, wrapAround = false) {
  // TODO: implement wraparound feature (if necessary)
  let newIndex = -1;
  switch(direction) {
    case 'up':
      newIndex = Math.max(index - columns, -1);
      break;
    case 'right':
      if(index + 1 < rows * columns) {
        if((index + 1) % columns !== 0 || wrapAround) {
          newIndex = index + 1;
        }
      }
      break;
    case 'down':
      newIndex = index + columns < rows * columns ? index + columns : -1;
      break;
    case 'left':
      if(index - 1 >= 0) {
        if((index) % columns !== 0 || wrapAround) {
          newIndex = index - 1;
        }
      }
      break;
    default:
      newIndex = index;
      break;
  }
  return newIndex;
};

const getFilledIndices = function (sparseArray) {
  return sparseArray.reduce((acc, item, i) => {
    if (item !== undefined) acc.push(i);
    return acc;
  }, []);
};
module.exports.getFilledIndices = getFilledIndices;

const getEmptyIndices = function (sparseArray) {
  const emptyIndices = [];
  for (let i = 0; i < sparseArray.length; i++) {
    if (sparseArray[i] === undefined) emptyIndices.push(i);
  }
  return emptyIndices;
};
module.exports.getEmptyIndices = getEmptyIndices;

const isSparseArrayFull = function (sparseArray) {
  return getFilledIndices(sparseArray).length >= sparseArray.length;
};
module.exports.isSparseArrayFull = isSparseArrayFull;

module.exports.getUnoccupiedSlot = function (sparseArray) {
  if (sparseArray.length > 0 && isSparseArrayFull(sparseArray)) {
    return null;
  } else {
    const availableSlots = getEmptyIndices(sparseArray);
    return availableSlots[getRandomIntegerInRange(0, availableSlots.length)];
  }
};

module.exports.getNeighbourCellValues = function(sparseArray, cols, index, edgeValue = { type: 'edge' }) {
  const rows = Math.ceil(sparseArray.length / cols);
  // console.log(`rows=${rows}; cols=${cols}; index=${index}`);
  const up = Math.floor(index/cols) === 0 ? edgeValue :
    sparseArray[index-cols] !== undefined ? sparseArray[index-cols] : null;
  const right = index % cols === cols - 1 ? edgeValue :
    sparseArray[index+1] !== undefined ? sparseArray[index+1] : null;
  const down = Math.floor(index / cols) === rows - 1 ? edgeValue:
    sparseArray[index+cols] !== undefined ? sparseArray[index+cols] : null;
  const left = index % cols === 0 ? edgeValue :
    sparseArray[index-1] !== undefined ? sparseArray[index-1] : null;
  return {up: up, right: right, down: down, left: left};
};

module.exports.getNeighbourCellIndices = function(sparseArray, cols, index, edgeValue = undefined) {
  const rows = Math.ceil(sparseArray.length / cols);
  const up = Math.floor(index/cols) === 0 ? edgeValue : index - cols;
  const right = index % cols === cols - 1 ? edgeValue : index + 1;
  const down = Math.floor(index / cols) === rows - 1 ? edgeValue: index + cols;
  const left = index % cols === 0 ? edgeValue : index - 1;
  return {up: up, right: right, down: down, left: left};
};


