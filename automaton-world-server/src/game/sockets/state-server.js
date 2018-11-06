const logger = require('../../logger');
const EventEmitter = require('events');
const Authentication = require('../../authentication');
const verifyToken = Authentication.verifyToken;

const namespaceIdentifier = 'state';

class StateServer extends EventEmitter {

  constructor(socketServer) {
    super();
    this.socketServer = socketServer;
    this.namespace = undefined;
  }

  localPing() {
    this.emit('pingResponse', 'StateServer responded to local ping');
  }

  connect() {
    this.namespace = this.socketServer.of(`/${namespaceIdentifier}`);
    this.emit('namespaceCreated', namespaceIdentifier);


    this.namespace.on('connection', (socket) => {
      // this is a perfect use case for inheritance from a core object
      if (socket.handshake.query && socket.handshake.query.token) {
        try {
          socket.decodedToken = verifyToken(socket.handshake.query.token)
        } catch (e) {
          logger.error(`an authentication error occurred %O`, e);
          logger.info(`token provided: %O`, socket.handshake.query.token);
          return;
        }
      } else {
        throw new Error('no credentials provided');
        return;
      }
      logger.info(`StateServer - a client connected: %O`, socket.decodedToken);
      this.emit('clientConnected', socket.id);

      let user = {
        userId: socket.decodedToken.userId,
        username: socket.decodedToken.username,
        roles: socket.decodedToken.roles
      };

      socket.on('disconnect', () => {
        logger.info(`StateServer - user disconnected: %O`, user);
        this.emit('userLeft', {clientId: socket.client.id}, user);
        // this.socketServer.of('events').emit('userStatus', {username: user.name, message: 'left'});
        logger.info('StateServer: user disconnected');
      });

      socket.on('penguin', (fn) => { // because 'ping' is a reserved word, apparently...?
        logger.info(`StateServer received ping: %O`, socket.handshake.query);
        fn({message: 'ping response from StateServer'});
      });

      socket.on('newGameRequest', (options) => {
        logger.info(`three: %O`, options);
        this.emit('newGameRequested', {rows: options.rows, columns: options.columns})
      });

      socket.on('gameParamsRequest', (fn) => {
        try {
          logger.info(`StateServer - gameParamsRequest`);
          this.emit('gameParamsRequest', {callback: fn});
          // fn({boardGrid: this.currentGame.size}); //, maxPlayers: MAX_PLAYERS});
        } catch (e) {
          logger.error(`gamesParamsRequest failed: %O`, e);
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

  newGameHandler(gameParameters) {
    logger.info(`five: %O`, gameParameters);
    this.namespace.emit('newGameCreated', gameParameters);
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

module.exports = StateServer;
