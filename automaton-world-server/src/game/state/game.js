const logger = require('../../logger');
const createGameStateMachine = require('./game-state-machine');

const {
  getRandomIntegerInRange,
  getRowAndColumnFromIndex,
  getUnoccupiedSlot,
  getFilledIndices,
  getRelativeIndex,
  getNeighbourCellValues,
  getNeighbourCellIndices
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
      boardGrid: {rows: numberOfRows, columns: numberOfColumns}
    }
  }

  function placeGameObject(gameObject, atIndex) {
    if (atIndex === undefined) {
      const slotIndex = getUnoccupiedSlot(cellStates, numberOfRows, numberOfColumns);
      if (slotIndex !== null) {
        cellStates[slotIndex] = gameObject;
      } else {
        // TODO: add an execution path for when the board is full
        throw new Error('board is full!');
      }
    } else {
      cellStates[atIndex] = gameObject;
    }
  }

  function printGameBoardASCII() {
    let boardString = '';
    for (let i = 0; i < cellStates.length; i++) {
      if (i % numberOfColumns === 0) {
        boardString += '\n'
      }
      if (cellStates[i] === undefined) {
        boardString += `- `;
      } else {
        boardString += cellStates[i].type.toUpperCase().substr(0, 1) + ' ';
      }
    }
    console.log(`\n${boardString}`);
  }

  // for development use only; very useful when working on board layout code
  function printBlankCellsASCII(blankCells, highlightedCells) {
    const spacerWidth = 2;
    const spacer = ''.padStart(spacerWidth);
    const rowStartIndexWidth = 4, rowNumberWidth = 3;
    const columnWidth = 3;
    let boardString = '';
    // print column headers
    boardString += ''.padStart(spacerWidth + rowStartIndexWidth + spacerWidth);
    for (let i = 0; i < numberOfColumns; i++) {
      boardString += i.toString().padEnd(columnWidth, ' ');
    }
    boardString += '\n';
    // print cells
    const originCharacter = 'O', terminusCharacter = 'X', emptyCellCharacter = 'E',
      hiliteCharacter = 'H', nullCharacter = '·';
    for (let i = 0; i < cellStates.length; i++) {
      // if(i === 0) {
      //   // boardString += i.toString().padStart(2, ' ') + ' ';
      // } else
      if (i % numberOfColumns === 0) {
        boardString += spacer + i.toString().padStart(rowStartIndexWidth, ' ') + spacer;
      }
      let cellString = nullCharacter;
      if (blankCells.includes(i)) {
        if (blankCells.indexOf(i) === blankCells.length - 1) {
          cellString = terminusCharacter
        } else if (blankCells.indexOf(i) === 0) {
          cellString = originCharacter;
        } else if (highlightedCells !== undefined && highlightedCells.includes(i)) {
          cellString = hiliteCharacter
        } else {
          cellString = emptyCellCharacter
        }
      }
      cellString = cellString.padEnd(columnWidth, ' ');
      if (cellString.includes(originCharacter)) {
        cellString = '\u001B[32m' + cellString + '\u001B[0m';
      } else if (cellString.includes(terminusCharacter)) {
        cellString = '\u001B[31m' + cellString + '\u001B[0m';
      } else if (cellString.includes(hiliteCharacter)) {
        cellString = '\u001B[33m' + cellString + '\u001B[0m';
      }
      boardString += cellString;
      // add the row number at the end of each row
      if (i % numberOfColumns === numberOfColumns - 1) {
        boardString += Math.floor(i / numberOfColumns) + '\n'; // .toString().padStart(rowNumberWidth, ' ') + '\n';
      }
    }
    console.log(`\n${boardString}`);
  }

  function getRandomNeighbourCellIndex(fromIndex, blankCells, mustBeEmpty = false) {
    const neighbourCells = getNeighbourCellValues(cellStates, numberOfColumns, fromIndex);
    const candidates = [];
    Object.keys(neighbourCells).forEach(key => {
      if (!mustBeEmpty || neighbourCells[key] === null) {
        const neighbourIndex = getRelativeIndex(fromIndex, numberOfRows, numberOfColumns, key);
        if (neighbourIndex >= 0 && (!mustBeEmpty || !blankCells.includes(neighbourIndex))) {
          candidates.push(neighbourIndex);
        }
      }
    });
    let neighbourCellIndex = undefined;
    if (candidates.length > 0) {
      neighbourCellIndex = candidates[getRandomIntegerInRange(0, candidates.length)];
    }
    return neighbourCellIndex;
  }

  // returns the most recently added cell with the highest number of empty neighbours
  function getCuspCell(blankCells, exhaustedCells, requiredAvailableNeighbours = 2) {
    if (requiredAvailableNeighbours === 0) {
      return;
    }
    let cuspCell = undefined;
    for (let i = blankCells.length - 1; i >= 0; i--) {
      const blank = blankCells[i];
      if (exhaustedCells.has(blank)) {
        continue;
      }
      const neighbourCellIndices = getNeighbourCellIndices(cellStates, numberOfColumns, blank);
      const emptyCellCount = Object.keys(neighbourCellIndices).reduce((count, key) => {
        if (neighbourCellIndices[key] !== undefined && !blankCells.includes(neighbourCellIndices[key])) {
          count++;
        }
        return count;
      }, 0);
      if (emptyCellCount === requiredAvailableNeighbours) {
        cuspCell = blank;
        break;
      }
    }
    if(cuspCell === undefined) {
        cuspCell = getCuspCell(blankCells, exhaustedCells, requiredAvailableNeighbours - 1);
    }
    return cuspCell;
  }

  // recursively defines which cells on the game board must remain empty of obstacles
  function addEmptyCell(fromCell, blankCells, maxEmptyCells, exhaustedCells = new Set()) {
    printBlankCellsASCII(blankCells, [fromCell]);
    if (blankCells.length === maxEmptyCells) return;
    const emptyCell = getRandomNeighbourCellIndex(fromCell, blankCells, true);
    if (emptyCell === undefined) {
      const currentEntryIndex = blankCells.indexOf(fromCell) || undefined;
      // if the fromCell is the last cell to have been added...
      const nextCell = currentEntryIndex === blankCells.length - 1 ?
        // then get the first available cell that has at least on unmarked neighbour;
        getCuspCell(blankCells, exhaustedCells) :
        // otherwise, just initiate/continue a drunkard's walk starting at the fromCell
        getRandomNeighbourCellIndex(fromCell, blankCells);
      exhaustedCells.add(fromCell);
      addEmptyCell(nextCell, blankCells, maxEmptyCells, exhaustedCells);
      // addEmptyCell(blankCells[currentEntryIndex - 1], blankCells, maxEmptyCells);
    } else {
      blankCells.push(emptyCell);
      addEmptyCell(emptyCell, blankCells, maxEmptyCells, exhaustedCells);
    }
  }

  function distributeObstacles(numberOfObstacles) {
    // get initial blank cell, randomly
    const startCellIndex = Math.floor(Math.random() * cellStates.length);
    const blankCells = [];
    blankCells.push(startCellIndex);
    // define the map of 'empty' cells (those which will not have an obstacle in them)
    addEmptyCell(startCellIndex, blankCells, cellStates.length - numberOfObstacles);
    // add obstacles to all other cells
    let obstacleIndex = 0;
    for (let i = 0; i < cellStates.length; i++) {
      if (cellStates[i] === undefined && !blankCells.includes(i))
        placeGameObject({id: `obstacle_${obstacleIndex++}`, type: 'obstacle'}, i);
    }
  }

  function setUp(numberOfObstacles, numberOfAssets, includeTarget) {
    logger.info(`Game - setup - includeTarget? ${includeTarget}`);
    if (includeTarget) {
      placeGameObject({id: 'primary_target', type: 'target'});
    }
    distributeObstacles(numberOfObstacles);
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
      placeGameObject({type: player.loginType, id: player.userId, name: player.username});
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
    if (statusManager.getCurrentStatus() === statusManager.states.starting) {
      statusManager.wait();
      return await getGameData();
    } else {
      return await processFrameResponses(playerResponseData);
    }
  }

  function stop() {
    statusManager.stop();
    return getGameData();
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
    return {
      status: statusManager.getCurrentStatus().name,
      parameters: getGameParameters(),
      layout: getCurrentState(),
      framePackets: framePacketData
    }
  }
/**/
  function moveEntry(fromIndex, toIndex) {
    if (toIndex !== fromIndex) {
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
    return new Promise((resolve /*, reject*/) => {
      if (playerResponseData === undefined) {
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

  if (options !== undefined && Object.keys(options).length > 0) {
    setUp(Math.round(getNumberOfCells() * options.percentObstacles), Math.round(getNumberOfCells() * options.percentAssets), options.includeTarget);
  }

  return {
    getNumberOfCells: getNumberOfCells,
    getGameParameters: getGameParameters,
    getCurrentState: getCurrentState,
    getCurrentStatus: statusManager.getCurrentStatus,
    getGameData: getGameData,
    setUp: setUp,
    start: start,
    stop: stop,
    nextFrame: nextFrame,
    getBoardPositions: getBoardPositions,
    distributePlayers: distributePlayers,
    loadState: loadState,
    processFrameResponses: processFrameResponses,
    printGameBoardASCII: printGameBoardASCII
  }
};

module.exports = {
  positionDataFilters: positionDataFilters,
  createNewGame: createNewGame,
};
