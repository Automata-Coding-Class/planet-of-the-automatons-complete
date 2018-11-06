const logger = require('../logger');
const Authentication = require('../authentication');
const createGameStateMachine = require('./state/game-state-machine');
const ChatServer = require('./chat-server');
const EventServer = require('./event-server');
const StateServer = require('./sockets/state-server');

const GameEngine = {};

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

const newGame = function(rows = 12, columns = 12) {
  currentGame = createGameStateMachine(rows, columns);
  return currentGame;
}

function connect(httpServer) {
  gameServer = require('socket.io')(httpServer);
  newGame();
//
//   const chatServer = new ChatServer();
//   chatServer.connect(gameServer);
//   chatServer.on('userJoined', userJoinedHandler);
//   chatServer.on('userLeft', userLeftHandler);
//
//   const eventServer = new EventServer(gameServer);
//   eventServer.connect();
//   eventServer.on('userJoined', userJoinedHandler);
//   eventServer.on('userLeft', userLeftHandler);
//
  const stateServer = new StateServer(gameServer);
  stateServer.connect();
  stateServer.on('newGameRequested', options => {
    logger.info(`four %O`, options);
    const game = newGame(options.rows, options.columns);
    stateServer.newGameHandler(game.getGameParameters());
  });
  stateServer.on('gameParamsRequest', request => {
    if(request.callback !== undefined) {
      request.callback(currentGame.getGameParameters());
    }
  });
//
//   stateServer.on('userJoined', userJoinedHandler);
//   stateServer.on('userLeft', userLeftHandler);
//   // TODO: surely there's a better way to pass function references to an eventemitter?
//   // i.e., directly, without the closure
//   stateServer.on('gameStarted', () => eventServer.sendGameEvent('game-started'));
//   stateServer.on('newFrame', (frame) => eventServer.distributeFrame(frame));
//   eventServer.on('startGameRequested', () => stateServer.startGame());
//   eventServer.on('stopGameRequested', () => stateServer.stopGame());
//   eventServer.on('userJoined',
//     (socketInfo, userData) => {
//       stateServer.addNewUser(socketInfo, userData);
//     });
//   eventServer.on('userLeft',
//     (socketInfo) => {
//       stateServer.removeUser(socketInfo);
//     });
//   eventServer.on('clientReady', id => stateServer.onClientReady(id) );
//   eventServer.on('playerRespondedToFrame', response => stateServer.onPlayerFrameResponse(response));
//
  gameServer.on('connection', function (socket) {
    logger.info('GameServer: client connected');
    // socket.broadcast.emit('announcement', 'foobar'); // sends to all _other_ sockets (I think)
    // gameServer.emit('announcement', 'a user connected');
    socket.on('disconnect', function () {
      logger.info('GameServer: client disconnected');
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
