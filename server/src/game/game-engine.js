const logger = require('../logger');
const createNewGame = require('./state/game').createNewGame;
const createGameOptions = require('./state/game-options');
const EventServer = require('./sockets/event-server');
const StateServer = require('./sockets/state-server');

const GameEngine = {};
const frameDelay = 125;

let gameServer = null;
const connectedUsers = new Map();
let currentGame;

const userJoinedHandler = function (socketInfo, userData) {
  connectedUsers.set(socketInfo.clientId, {user: userData, namespace: socketInfo.namespace});
  broadcastUserList(gameServer);
  logger.info(`connectedUsers: ${JSON.stringify(Array.from(connectedUsers.keys()))}`);
};

const userLeftHandler = function (socketInfo, data) {
  logger.info(`user left (${socketInfo.clientId}): ${data.username}`);
  if (connectedUsers.has(socketInfo.clientId)) {
    connectedUsers.delete(socketInfo.clientId);
    broadcastUserList(gameServer); // i.e., only if there's a change
  }
  logger.info(`connectedUsers: ${JSON.stringify(Array.from(connectedUsers.keys()))}`);
};

const broadcastUserList = function (server) {
  const flattenedUserList = Array.from(connectedUsers.entries()).reduce((acc, entry) => {
    acc.push({socketId: entry[0], user: entry[1].user});
    return acc;
  }, []);
  logger.info('flattenedUserList: ' + JSON.stringify(flattenedUserList));
  logger.info(`about to broadcast the user list: ${JSON.stringify(flattenedUserList)}`);
  server.of('state').emit('connection-list', flattenedUserList);
};

const newGame = function (rows = 12, columns = 12, gameOptions) {
  currentGame = createNewGame(rows, columns, gameOptions);
  return currentGame;
};

function connect(httpServer) {
  gameServer = require('socket.io')(httpServer);
  gameServer.origins((origin, callback) => {
    callback(null, true);
  });

  const eventServer = new EventServer(gameServer);
  eventServer.connect();
  const stateServer = new StateServer(gameServer);
  stateServer.connect();

  stateServer.on('newGameRequested', options => {
    // TODO: replace this with code that's responsive to the request
    const gameOptions = createGameOptions()
      .addPercentObstacles(0.2)
      .addPercentAssets(0.1);
    const game = newGame(options.rows, options.columns, gameOptions);
    const gameData = game.getGameData();
    eventServer.broadcastGameInitialization(gameData);
    stateServer.newGameHandler(gameData);
  });
  stateServer.on('gameParamsRequest', request => {
    if (request.callback !== undefined) {
      request.callback(currentGame.getGameParameters());
    }
  });
  stateServer.on('gameDataRequested', callback => {
    if (callback !== undefined) {
      callback(currentGame !== undefined ? currentGame.getGameData() : undefined);
    }
  });
  stateServer.on('startGame', () => {
    stateServer.broadcastGameState(currentGame.start(eventServer.getActivePlayerList()));
    eventServer.broadcastGameStart();
  });
  stateServer.on('pauseGame', () => {
    logger.info('WILL PAUSE GAME!!');
    eventServer.pauseGame();
    stateServer.broadcastGameState(currentGame.pause());
  });
  stateServer.on('resumeGame', () => {
    logger.info('WILL RESUME GAME!!');
    eventServer.resumeGame();
    stateServer.broadcastGameState(currentGame.resume());
  });
  stateServer.on('stopGame', () => {
    eventServer.stopGame();
    stateServer.broadcastGameState(currentGame !== undefined ? currentGame.stop() : undefined);
  });

  function advanceFrame(frameResponseData) {
    if(currentGame.getCurrentStatus().name !== 'stopped') {
      currentGame.nextFrame(frameResponseData)
        .then(gameData => {
          logger.info(`preparing to send updated game data: %o`, gameData);
          if (gameData !== undefined) {
            setTimeout(() => {
              eventServer.distributeGameState(gameData.framePackets);
            }, frameDelay);
          }
          stateServer.broadcastGameState(gameData);
        });
    }
  }

  eventServer.on('playersReady', () => {
    logger.info(`GameEngine - playersReady`);
    advanceFrame();
  });
  eventServer.on('frameResponsesReceived', (frameResponseData) => {
      logger.info(`GameEngine - frameResponseReceived: %o`, frameResponseData);
      advanceFrame(frameResponseData);
  });
  gameServer.on('connection', function (socket) {
    logger.info(`GameServer - client connected: socket.id='%s', namespace='%s'`, socket.id, socket.nsp.name);
    socket.on('disconnect', function () {
      logger.info('GameEngine - client disconnected: %o', socket.decodedToken);
    });
  });

  return gameServer;
}

Object.defineProperty(
  GameEngine,
  'connect',
  {
    value: connect,
    writable: false
  });

module.exports = GameEngine;
