const logger = require('../logger');
const http = require('http');
const io = require('socket.io');
const namespaceIdentifier = '/rules';
const engineName = 'Internal Default';
const createNewGame = require('./state/game').createNewGame;

function getRulesEnginePort() {
  const rawPortValue = process.env.RULES_ENGINE_PORT || '5000';
  const port = parseInt(rawPortValue, 10);
  if (isNaN(port)) { // named pipe
    return rawPortValue;
  }
  if (port >= 0) { // port number
    return port;
  }
  return false;
}

function instantiateHttpServer() {
  const server = http.createServer(function (req, res) {
    // res.json({status: 'running'});
    res.writeHead(200, {'Content-Type': 'application/JSON'});
    res.end(JSON.stringify({status: 'okay', name: engineName}));
  });
  const port = getRulesEnginePort();
  server.listen(port);
  return server;
}

function log(msg, ...args) {
  logger.info(`RulesEngine - ` + msg, ...args);
}

const createNewRulesEngine = function () {
  const server = instantiateHttpServer();
  const socket = io(server, {path: '/rules'});
  const namespace = socket.of(namespaceIdentifier);
  const activeGames = new Map();

  function addNewGame(options) {
    const newGame = createNewGame(options);
    log(`game: %o`, newGame);
    activeGames.set(newGame.id, newGame);
    return newGame;
  }

  socket.on('connection', (client) => {
    logger.info(`RulesEngine - client connected: %o`, client);
    client.on('newGameRequested', (options, fn) => {
      const newGame = addNewGame(options);
      newGame.on('gameOver', () => {
        logger.info(`RulesEngine: received gameOver event from game '%s'`, newGame.id);
        client.emit('gameOver', newGame.getGameData());
      });
      fn({gameData: newGame.getGameData()});
    });
    client.on('gameParamsRequest', (gameId, fn) => {
      const game = activeGames.get(gameId);
      if (game !== undefined && fn !== undefined) {
        fn(game.getGameParameters());
      }
    });
    client.on('gameDataRequest', (gameId, fn) => {
      const game = activeGames.get(gameId);
      if (game !== undefined && fn !== undefined) {
        fn(game.getGameData());
      }
    });
    client.on('startGame', (gameId, playerList, fn) => {
      log(`startGame ${gameId}: %o`, playerList);
      const game = activeGames.get(gameId);
      if (game !== undefined && fn !== undefined) {
        fn(game.start(playerList));
      }
    });
    client.on('advanceFrame', (gameId, frameResponseData, fn) => {
      log(`advanceFrame (gameId= ${gameId}). frameResponseData: %o`, frameResponseData);
      const game = activeGames.get(gameId);
      if (game !== undefined && fn !== undefined) {
        game.processFrameResponses(frameResponseData.frameResponse)
          .then(updatedGameData => {
            log('updatedGameData: %o', updatedGameData);
            fn(updatedGameData);
          },
            err => {
            log(`game '%s' rejected processFrameResponses call: %o`, game.id, err);
            });
      }
    });
    client.on('pauseGame', (gameId, fn) => {
      log(`pauseGame ${gameId}`);
      const game = activeGames.get(gameId);
      if (game !== undefined && fn !== undefined) {
        const gameData = game.pause();
        logger.info(`RuleEngine will return paused game data: %o`, gameData);
        fn(gameData);
      }
    });
    client.on('resumeGame', (gameId, fn) => {
      log(`resumeGame ${gameId}`);
      const game = activeGames.get(gameId);
      if (game !== undefined && fn !== undefined) {
        const gameData = game.resume();
        logger.info(`RuleEngine resumed game: %o`, gameData);
        fn(gameData);
      }
    });
    client.on('stopGame', (gameId, fn) => {
      const game = activeGames.get(gameId);
      if (game !== undefined) {
        const finalState = game.stop();
        if(fn !== undefined) {
          fn(finalState);
        }
      }
    });
  });

  return {};
};

module.exports = createNewRulesEngine;

