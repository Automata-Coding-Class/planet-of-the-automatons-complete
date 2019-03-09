const logger = require('../../logger');
const uuid = require('uuid/v1');
const lzutf8 = require('lzutf8');
const sha512 = require('js-sha512');
const createGameStateMachine = require('./game-state-machine');
const createGameTimer = require('./game-timer');

const {
  getRandomIntegerInRange,
  getRowAndColumnFromIndex,
  getUnoccupiedSlot,
  getFilledIndices,
  getRelativeIndex,
  getNeighbourCellValues,
  getNeighbourCellIndices
} = require('./state-utils');

const GameObject = require('./game-object');
/**/
const positionDataFilters = {
  returnAll: () => true,
  playersOnly: positionData => positionData.data.type === 'player',
  obstaclesOnly: positionData => positionData.data.type === 'obstacle',
  assetsOnly: positionData => positionData.data.type === 'asset',
};

const createNewGame = function createNewGame(options) {
  const numberOfRows = parseInt(options.rows);
  const numberOfColumns = parseInt(options.columns);
  const duration = parseInt(options.duration);

  const gameTimer = createGameTimer(duration);

  // options also include:
  // - percentObstacles: portion of the board to fill with obstacles (0.0 - 1.0)
  // - percentAssets: portions of the board to fill with assets (0.0 - 1.0)
  //                                         }
  const cellStates = new Array(numberOfRows * numberOfColumns);
  const statusManager = createGameStateMachine();
  const playerData = new Map();
  const numberOfAssets = Math.round(getNumberOfCells() * options.percentAssets);

  let frameId = -1;
  let totalAvailablePoints = 0;

  function getNumberOfCells() {
    return cellStates.length;
  }

  function getGameParameters() {
    return {
      boardGrid: {rows: numberOfRows, columns: numberOfColumns},
      duration: gameTimer.getDuration()
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

  // for development use only; very useful when working on board layout code, BUT...
  // quite expensive in terms of processor time, floods the console, and makes game
  // creation laggy. Only use when absolutely necessary.
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
    if (cuspCell === undefined) {
      cuspCell = getCuspCell(blankCells, exhaustedCells, requiredAvailableNeighbours - 1);
    }
    return cuspCell;
  }

  // recursively defines which cells on the game board must remain empty of obstacles
  function addEmptyCell(fromCell, blankCells, maxEmptyCells, exhaustedCells = new Set()) {
    // printBlankCellsASCII(blankCells, [fromCell]);
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

    const gameObjectList = GameObject.createGameObjectList(numberOfAssets);
    gameObjectList.forEach(gameObj => {
      if(gameObj.category === 'scoring') {
        totalAvailablePoints += gameObj.value;
      }
      placeGameObject(gameObj);
    });
  }

  function start(players) {
    logger.info(`Game - start. Players: %o`, players);
    frameId = 0;
    const stateSnapshot = [].concat(cellStates);
    distributePlayers(players);
    statusManager.start();
    gameTimer.start()
      .then(() => {
          logger.info(`initial timer promise fulfilled`);
          endGame();
        },
        err => {
          logger.info(`initial timer promise rejected`);
        });
    return getGameData();
  }

  function distributePlayers(players) {
    playerData.clear();
    players.forEach(player => {
      placeGameObject({type: player.loginType, id: player.userId, name: player.username});
      playerData.set(player.userId, {score: 0, assets: [], rawData: player});
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
    logger.info(`Game - playerPositions: %o`, playerPositions);
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

  function pause() {
    statusManager.pause();
    gameTimer.pause();
    const gameData = getGameData();
    logger.info(`Game '%s' has just paused itself: %o`, gameId, gameData);
    return gameData;
  }

  function resume() {
    logger.info(`Game - will resume game ${gameId}`);
    statusManager.resume();
    gameTimer.resume().then(() => {
        logger.info(`resumed timer promise fulfilled`);
        endGame();
      },
      err => {
        logger.info(`resumed timer promise rejected`);
      });
    return getGameData();
  }

  function adjustTime(seconds) {
    gameTimer.adjustTime(seconds)
      .then(() => {
        endGame();
      })
  }

  function stop() {
    statusManager.stop();
    return getGameData();
  }

  function endGame() {
    dispatchEvent('gameOver');
  }

  function loadState(savedState) {
    cellStates.splice(0, cellStates.length, ...savedState);
  }

  function getCurrentState() {
    return [].concat(cellStates);
  }

  function getCurrentPlayerStates() {
    const playerStates = {};
    playerData.forEach((playerData, playerId) => {
      playerStates[playerId] = playerData;
    });
    return playerStates;
  }

  function getGameData() {
    const framePacketData = makeFramePackets();
    logger.info(`Game - frame id '%i': %o`, frameId, framePacketData);
    return {
      id: gameId,
      status: statusManager.getCurrentStatus().name,
      elapsedTime: gameTimer.getElapsedTime(),
      parameters: getGameParameters(),
      layout: getCurrentState(),
      frame: {
        id: frameId,
        packets: framePacketData
      },
      playerData: getCurrentPlayerStates(),
      totalAssets: numberOfAssets,
      totalAvailablePoints: totalAvailablePoints
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
    frameId++;
    return new Promise((resolve , reject) => {
      if (playerResponseData === undefined) {
        resolve(Object.assign(getGameData(), {changeSummary: undefined}));
        return;
      }
      if(statusManager.getCurrentStatus().name === 'stopped') {
        reject({message: 'game has ended; will not process more frames', data: getGameData()});
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
              const player = playerData.get(playerId);
              if (
                destinationCellOccupant !== undefined && (/(asset|scoring)/i).test(destinationCellOccupant.category)) {
                const asset = removeEntry(destinationCellIndex);
                if (player !== undefined) {
                  player.score += destinationCellOccupant.value;
                  logger.info(`*** UPDATED SCORE FOR PLAYER '${playerId}': ${player.score}`);
                }
                destinationCellOccupant = undefined;
                changeSummary.push({
                  change: 'acquisition',
                  playerId: playerId,
                  acquired: asset
                });
              }
              else if(destinationCellOccupant !== undefined && (/(powerUp|hazard)/i).test(destinationCellOccupant.category)) {
                const asset = removeEntry(destinationCellIndex);
                destinationCellOccupant = undefined;
                if(asset.activation === 'instant' && asset.action !== undefined) {
                  const delta = asset.action(player);
                  switch(delta.change) {
                    case 'timeAdjustment':
                      adjustTime(delta.timeAdjustment);
                      break;
                  }
                  changeSummary.push(delta);
                }
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
      const gameData = getGameData();
      if(gameData.status !== 'paused') {
        logger.info(`processedFrameResponse: %o, %o`, gameData, changeSummary);
        resolve(Object.assign(gameData, {changeSummary: changeSummary}));
      }
    });
  }

  function addTargets(numberOfTargets = 1) {
    for (let i = 0; i < numberOfTargets; i++) {
      placeGameObject('target', i);
    }
  }

  if (options !== undefined && Object.keys(options).length > 0) {
    setUp(Math.round(getNumberOfCells() * options.percentObstacles), numberOfAssets, options.includeTarget);
  }

  // event publishing
  const eventListeners = new Map();

  const addEventListener = function (eventType, listener) {
    if (!eventListeners.has(eventType)) {
      eventListeners.set(eventType, []);
    }
    const listenerArray = eventListeners.get(eventType);
    if (!listenerArray.includes(listener)) {
      listenerArray.push(listener);
    }
  };

  const dispatchEvent = async function (eventType, ...args) {
    if (eventListeners.has(eventType)) {
      eventListeners.get(eventType).map(handler => handler(...args));
    }
  };

  function getCellStatesStringRepresentation(sparseArrayNotation = false) {
    let stateString = '';

    function convertToPadded32Bit(i) {
      return i.toString(32).padStart(2, '0');
    }

    if (sparseArrayNotation) {
      stateString += convertToPadded32Bit(numberOfColumns);
      stateString += cellStates.reduce((cellStr, cell, i) => {
        cellStr+= `${convertToPadded32Bit(i)}`;
        cellStr+= cell.type.substr(0, 1).toUpperCase();
        return cellStr;
      },'')
    } else {
      for (let i = 0; i < cellStates.length; i++) {
        stateString += cellStates[i] === undefined ? '_' :
          cellStates[i].type.substr(0, 1).toUpperCase();
      }
    }
    return stateString;
  }

  // tearing a page from Git's book, we're constructing a hash-like to use
  // as the game's id so that we can (reasonably) reliably display a
  // unique truncated form to the humans; however, since we don't need
  // encryption, we can get that human-readable id PLUS the added benefit
  // of being able to decompress it to reconstitute a game from it's id.
  // That's not being used now, but once we start adding historical
  // recording and game re-playability, I think it will come in quite handy
  function generateGameId() {
    const cellStatesString = getCellStatesStringRepresentation();
    const seed = (new Date()).toISOString() + cellStatesString;
    const compressedCellStates = lzutf8.compress(seed, {outputEncoding: 'StorageBinaryString'});
    const hash = sha512(compressedCellStates);
    return hash.substr(0, 16);
  }

  const gameId = generateGameId();
  console.log(`gameId is ${gameId.length} chars long`);

  return {
    id: gameId,
    getNumberOfCells: getNumberOfCells,
    getGameParameters: getGameParameters,
    getCurrentState: getCurrentState,
    getCurrentStatus: statusManager.getCurrentStatus,
    getGameData: getGameData,
    setUp: setUp,
    start: start,
    pause: pause,
    resume: resume,
    stop: stop,
    nextFrame: nextFrame,
    getBoardPositions: getBoardPositions,
    distributePlayers: distributePlayers,
    loadState: loadState,
    processFrameResponses: processFrameResponses,
    printGameBoardASCII: printGameBoardASCII,
    on: addEventListener
  }
};

module.exports = {
  positionDataFilters: positionDataFilters,
  createNewGame: createNewGame,
};
