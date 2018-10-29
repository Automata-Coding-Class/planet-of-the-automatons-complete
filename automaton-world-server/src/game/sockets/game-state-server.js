const logger = require('../../logger');
const EventEmitter = require('events');

const namespaceIdentifier = 'state';

class GameStateServer extends EventEmitter {

  constructor(socketServer) {
    super();
    this.socketServer = socketServer;
    this.namespace = undefined;
  }

  ping() {
    this.emit('pingResponse', 'GameStateServer responded to ping');
  }

  connect() {
    this.namespace = this.socketServer.of(`/${namespaceIdentifier}`);
    this.emit('namespaceCreated', namespaceIdentifier);

    this.namespace.on('connection', (socket) => {
      this.emit('clientConnected', socket.id);

      let user;
      socket.on('loginData', (data) => {
        logger.info('GameStateServer: a client sent login data, data');
        user = data;
        this.emit('userJoined', {clientId: socket.client.id}, data);
        this.socketServer.of('event').emit('userStatus', {username: user.name, message: 'joined'});
      })

      socket.on('disconnect', () => {
        this.emit('userLeft', {clientId: socket.client.id}, user);
        this.socketServer.of('events').emit('userStatus', {username: user.name, message: 'left'});
        logger.info('GameStateServer: user disconnected');
      });

      socket.on('gameParamsRequest', (fn) => {
        try {
          fn({boardGrid: this.gameState.size, maxPlayers: MAX_PLAYERS});
        } catch (e) {
          logger.error(JSON.stringify(e));
        }
      });

      socket.on('gameStateRequest', (fn) => {
        try {
          fn(this.gameState.getCurrentState());
        } catch (e) {
          logger.error(JSON.stringify(e));
        }
      });
    });
  }

  disconnect() {
    const connectedNamespaceSockets = Object.keys(this.namespace.connected);
    connectedNamespaceSockets.forEach(socketId => {
      this.namespace.connected[socketId].disconnect();
    })
    this.namespace.removeAllListeners();
    delete this.socketServer.nsps[`/${namespaceIdentifier}`];
  }
}

module.exports = GameStateServer;
