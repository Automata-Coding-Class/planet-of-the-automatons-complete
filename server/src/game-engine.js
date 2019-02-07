const logger = require('./logger');
const createNewGame = require('./game/state/game').createNewGame;
const createGameOptions = require('./game/state/game-options');
const EventServer = require('./sockets/event-server');
const StateServer = require('./sockets/state-server');
const GameFactory = require('./game-factory');
const createNewRulesEngine = require('./game/rules-engine');

const GameEngine = {};
const frameDelay = 125;

let gameServer = null;
const connectedUsers = new Map();
let currentGame;
const activeGames = new Map();

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

const newGame = function (gameOptions = {rows: 12, columns: 12, duration: 30}) {
  currentGame = createNewGame(gameOptions);
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
  const gameFactory = new GameFactory();

  stateServer.on('availableRulesEnginesRequested', () => {
    gameFactory.getAvailableRulesEngines()
      .then(engines => {
        stateServer.broadcastAvailableRulesEnginesList(engines);
      });
  });
  stateServer.on('newGameRequested', options => {
    // TODO: replace this with code that's responsive to the request
    const gameOptions = createGameOptions(options)
      .addPercentObstacles(0.2)
      .addPercentAssets(0.1);
    GameFactory.createNewGame(gameOptions)
      .then(gameProxy => {
        logger.info(`GameEngine - new game: %o`, gameProxy);
        gameProxy.on('gameOver', finalGameData => {
          logger.info(`GameEngine - received gameOver local event from proxy '%s': %o`, gameProxy.gameId, finalGameData);
          finishGame(finalGameData.id, finalGameData)
        });
        activeGames.set(gameProxy.gameId, gameProxy);
        eventServer.broadcastGameInitialization(gameProxy.initialGameData);
        stateServer.newGameHandler(gameProxy.initialGameData);
      });
  });
  stateServer.on('gameParamsRequest', request => {
    logger.info(`gameParamsRequest event handler: %o:`, request);
    const game = activeGames.get(request.gameId);
    if (game !== undefined) {
      logger.info(`retrieved active game: %o`, game);
      game.getGameParameters()
        .then(response => {
          if (request.callback !== undefined) {
            request.callback(response); //game.getGameParameters());
          }
        });
    }
  });
  stateServer.on('gameDataRequested', request => {
    logger.info(`gameParamsRequest event handler: %o:`, request);
    const game = activeGames.get(request.gameId);
    if (game !== undefined && request.callback !== undefined) {
      game.getGameData()
        .then(response => {
          request.callback(response);
        })
    }
  });
  stateServer.on('startGame', request => {
    const game = activeGames.get(request.gameId);
    if (game !== undefined) {
      logger.info(`startGame handler: %o`, request);
      game.start(eventServer.getActivePlayerList())
        .then(gameData => {
          logger.info(`startGame handler response received: %o`, gameData);
          notifyRemoteClients(gameData);
        })
    }

  });
  stateServer.on('pauseGame', request => {
    logger.info('WILL PAUSE GAME!!');
    eventServer.pauseGame(request.gameId);
    const game = activeGames.get(request.gameId);
    if (game !== undefined) {
      game.pause()
        .then(response => {
          logger.info(`game was paused. response is: %o`, response);
          stateServer.broadcastGameState(response);
        });
    }
  });

  stateServer.on('resumeGame', request => {
    logger.info('WILL RESUME GAME!!');
    eventServer.resumeGame(request.gameId);
    const game = activeGames.get(request.gameId);
    if (game !== undefined) {
      const pendingState = game.getPendingState();
      game.resume()
        .then(gameData => {
          logger.info(`GameEngine - game.resume() returned: %o`, gameData);
          if (pendingState !== undefined) {
            logger.info(`GameEngine - pendingState: %o`, pendingState);
            notifyRemoteClients(pendingState);
          }
        });
    }
  });

  function finishGame(gameId) {
    logger.info(`GameEngine - finishGame '%s'`, gameId);
    eventServer.stopGame(gameId);
    const game = activeGames.get(gameId);
    if (game !== undefined) {
      game.stop().then(response => {
        stateServer.broadcastGameState(response);
      });
    }
  }

  stateServer.on('stopGame', request => {
    finishGame(request.gameId);
  });


  function notifyRemoteClients(updatedGameData) {
    eventServer.distributeGameState(updatedGameData);
    stateServer.broadcastGameState(updatedGameData);
  }

  // this function is isolated because it needs to be part of this 'top-level' closure;
  // or, more to the point, the promise handler inside 'advanceFrame' must not use the
  // game state that gets embedded in its closure
  function checkUpdatedGameState(gameId, updatedGameData) {
    const game = activeGames.get(gameId);
    if (game !== undefined && !game.isStoppedOrPaused()) {
      notifyRemoteClients(updatedGameData);
    } else {
      game.setPendingState(updatedGameData);
    }
    logger.info(`GameEngine - checked updated game state. GameProxy: paused=%o; pendingState: %o`, game.isStoppedOrPaused(), game.getPendingState());
  }

  function advanceFrame(frameResponseData) {
    logger.info(`GameEngine - advanceFrame. frameResponseData: %o`, frameResponseData);
    const game = activeGames.get(frameResponseData.gameId);
    if (game !== undefined) {
      logger.info(`GameEngine - found active: %o`, game);
      game.advanceFrame(frameResponseData)
        .then(updatedGameData => {
          logger.info(`GameEngine - advanceFrame updatedGameData: %o`, updatedGameData);
          setTimeout(() => {
            checkUpdatedGameState(game.gameId, updatedGameData);
          }, frameDelay)
        });
    }
  }

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

  // create the local, default rules engine
  const defaultRulesEngine = createNewRulesEngine();

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
