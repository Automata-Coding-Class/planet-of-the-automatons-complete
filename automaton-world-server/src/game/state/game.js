const logger = require('../../logger');
const createGameStateMachine = require('./game-state-machine');
const { getNeighbourCellValues } = require('./state-utils');

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
  numberOfRows = parseInt(numberOfRows);
  numberOfColumns = parseInt(numberOfColumns);
  // options are:
  // - percentObstacles: portion of the board to fill with obstacles (0.0 - 1.0)
  // - percentAssets: portions of the board to fill with assets (0.0 - 1.0)
  //                                         }
  const cellStates = new Array(numberOfRows * numberOfColumns);
  const statusManager = createGameStateMachine();

  function getNumberOfCells() {
    return cellStates.length;
  }

  function getGameParameters() {
    return {
      boardGrid: {rows: numberOfRows, columns: numberOfColumns }
    }
  }

  function placeGameObject(gameObject, row, column) {
    if (row === undefined || column === undefined) {
      const slotIndex = getUnoccupiedSlot(cellStates, numberOfRows, numberOfColumns);
      if (slotIndex !== null) {
        cellStates[slotIndex] = gameObject;
      } else {
        // TODO: add an execution path for when the board is full
        throw new Error('board is full!');
      }
    }
  }

  function setUp(numberOfObstacles, numberOfAssets) {
    placeGameObject({ id: 'primary_target', type: 'target'});
    for (let i = 0; i < numberOfObstacles; i++) {
      placeGameObject({ id: `obstacle_${i}`, type: 'obstacle'});
    }
    for (let i = 0; i < numberOfAssets; i++) {
      placeGameObject({id: `asset_${i}`, type: 'asset'});
    }
  }

  function start(players) {
    logger.info(`Game - start. Players: %o`, players);
    const stateSnapshot = [].concat(cellStates);
    distributePlayers(players);
    statusManager.start();
    return getGameData();
  }

  function distributePlayers(players) {
    players.forEach(player => {
      placeGameObject({type: player.loginType, id: player.userId, name: player.username });
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

  function makeFramePackets() {
    const playerPositions = getPlayerPositions();
    logger.info(`playerPositions: %o`, playerPositions);
    return Object.keys(playerPositions).reduce((framePacketData, positionKey) => {
      framePacketData[positionKey] = getNeighbourCellValues(cellStates, numberOfColumns, playerPositions[positionKey].index);
      return framePacketData;
    }, {});
  }

  async function nextFrame(playerResponseData) {
    logger.info(`Game - will process next frame`);
    if(statusManager.getCurrentStatus() === statusManager.states.starting) {
      statusManager.wait();
      const gameData = await getGameData();
      return gameData;
    } else {
      return await processFrameResponses(playerResponseData);
    }
  }

  function loadState(savedState) {
    cellStates.splice(0, cellStates.length, ...savedState);
  }

  function getCurrentState() {
    return [].concat(cellStates);
  }

  function getGameData() {
    const framePacketData = makeFramePackets();
    logger.info(`framePacketData: %o`, framePacketData);
    return { status: statusManager.getCurrentStatus().name, parameters: getGameParameters(), layout: getCurrentState(), framePackets: framePacketData }
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

  function processFrameResponses(playerResponseData) {
    return new Promise((resolve /*, reject*/ ) => {
      if(playerResponseData === undefined) {
        resolve(Object.assign(getGameData(), {changeSummary: undefined}));
        return;
      }
      const changeSummary = [];
      const playerPositions = getPlayerPositions();
      Object.keys(playerResponseData).forEach(playerId => {
      // TODO: record proposed states first and then do conflict resolution as necessary
      // but for now...
        const playerIndex = playerPositions[playerId].index;
        const response = playerResponseData[playerId];
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
      resolve(Object.assign(getGameData(), {changeSummary: changeSummary}));
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
    getGameParameters: getGameParameters,
    getCurrentState: getCurrentState,
    getGameData: getGameData,
    setUp: setUp,
    start: start,
    nextFrame: nextFrame,
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
