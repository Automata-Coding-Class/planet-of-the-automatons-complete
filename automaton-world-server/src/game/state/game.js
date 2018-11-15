const {
  getRowAndColumnFromIndex,
  getUnoccupiedSlot,
  getFilledIndices,
  getRelativeIndex
} = require('./state-utils');

const createGameObject = require('./game-object');

const positionDataFilters = {
  returnAll: () => true,
  playersOnly: positionData => positionData.data.type === 'player',
  obstaclesOnly: positionData => positionData.data.type === 'obstacle',
  assetsOnly: positionData => positionData.data.type === 'asset',
};

const createNewGame = function createNewGame(numberOfRows, numberOfColumns, options) {
  // options are:
  // - percentObstacles: portion of the board to fill with obstacles (0.0 - 1.0)
  // - percentAssets: portions of the board to fill with assets (0.0 - 1.0)
  //                                         }
  const cellStates = new Array(numberOfRows * numberOfColumns);

  function getNumberOfCells() {
    return cellStates.length;
  }

  function placeGameObject(id, type, row, column) {
    if (row === undefined || column === undefined) {
      const slotIndex = getUnoccupiedSlot(cellStates, numberOfRows, numberOfColumns);
      if(slotIndex !== null) {
        cellStates[slotIndex] = {type: type, id: id};
      } else {
        // TODO: add an execution path for when the board is full
        throw new Error('board is full!');
      }
    }
  }

  function setUp(numberOfObstacles, numberOfAssets) {
    placeGameObject('primary_target', 'target');
    for (let i = 0; i < numberOfObstacles; i++) {
      placeGameObject(`obstacle_${i}`, 'obstacle');
    }
    for (let i = 0; i < numberOfAssets; i++) {
      placeGameObject(`asset_${i}`, 'asset');
    }
  }

  function distributePlayers(playerIdList) {
    playerIdList.forEach(playerId => {
      placeGameObject(playerId, 'player');
    });
  }

  function getBoardPositions(filter) {
    const filledIndices = getFilledIndices(cellStates);
    return filledIndices.map(index => {
      const positionData = getRowAndColumnFromIndex(numberOfRows, numberOfColumns, index);
      positionData.index = index;
      positionData.data = cellStates[index];
      return positionData;
    }).filter(filter !== undefined ? filter : positionDataFilters.returnAll);
  }

  function getPlayerPositions() {
    return getBoardPositions(positionDataFilters.playersOnly)
      .reduce((positions, positionData) => {
        positions[positionData.data.id] = {
          index: positionData.index,
          row: positionData.row,
          col: positionData.col
        };
        return positions;
      }, {})
  }

  function loadState(savedState) {
    cellStates.splice(0, cellStates.length, ...savedState);
  }

  function getCurrentState() {
    return [].concat(cellStates);
  }

  function moveEntry(fromIndex, toIndex) {
    if(toIndex !== fromIndex) {
      cellStates[toIndex] = cellStates[fromIndex];
      cellStates[fromIndex] = undefined;
      return true;
    }
    return false;
  }

  function removeEntry(atIndex) {
    const entry = cellStates[atIndex];
    cellStates[atIndex] = undefined;
    return entry;
  }

  function processFrameResponses(responseList) {
    return new Promise((resolve /*, reject*/ ) => {
      const changeSummary = [];
      const playerPositions = getPlayerPositions();
      responseList.forEach(response => {
      //   // TODO: record proposed states first and then do conflict resolution as necessary
      //   // but for now...
        const playerId = response.id;
        const playerIndex = playerPositions[playerId].index;
        // const neighbourCells = getNeighbourCellValues(cellStates, numberOfColumns, playerIndex);
        switch (response.action.type) {
          case 'move':
          default:
            const destinationCellIndex = getRelativeIndex(playerIndex, numberOfRows, numberOfColumns, response.action.direction);
            let destinationCellOccupant = cellStates[destinationCellIndex];
            if (destinationCellIndex !== -1) {
              if (
                destinationCellOccupant !== undefined && destinationCellOccupant.type === 'asset') {
                const asset = removeEntry(destinationCellIndex);
                destinationCellOccupant = undefined;
                changeSummary.push({
                  change: 'acquisition',
                  playerId: playerId,
                  acquired: asset
                });
              }
              if (destinationCellOccupant === undefined) {
                const originalIndex = playerIndex;
                const newIndex = destinationCellIndex;
                if (moveEntry(playerPositions[playerId].index, newIndex)) {
                  changeSummary.push({
                    change: 'move',
                    type: 'player',
                    playerId: playerId,
                    from: originalIndex,
                    to: newIndex
                  })
                }
              }
            }
            break;
        }
      });
      resolve({updatedState: getCurrentState(), changeSummary: changeSummary});
    });
  }

  function addTargets(numberOfTargets = 1) {
    for (let i = 0; i < numberOfTargets; i++) {
      placeGameObject('target', i);
    }
  }

  if(options !== undefined && Object.keys(options).length > 0) {
    setUp(Math.round(getNumberOfCells() * options.percentObstacles), Math.round(getNumberOfCells() * options.percentAssets));
  }

  return {
    getNumberOfCells: getNumberOfCells,
    getCurrentState: getCurrentState,
    setUp: setUp,
    getBoardPositions: getBoardPositions,
    distributePlayers: distributePlayers,
    loadState: loadState,
    processFrameResponses: processFrameResponses
  }
};

module.exports = {
  positionDataFilters: positionDataFilters,
  createNewGame: createNewGame
}
