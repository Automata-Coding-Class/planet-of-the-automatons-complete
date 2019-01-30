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

const createNewRulesEngine = function() {
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
    client.on('newGameRequested', (options, ack) => {
      const newGame = addNewGame(options);
      ack({gameData: newGame.getGameData()});
    });
    client.on('gameParamsRequest', (gameId, fn) => {
      const game = activeGames.get(gameId);
      if (game !== undefined && fn !== undefined) {
        fn(game.getGameParameters());
      }
    });
  });

  return {};
};

module.exports = createNewRulesEngine;

