const logger = require('../../logger');
const EventEmitter = require('events');
const Authentication = require('../../authentication');
const verifyToken = Authentication.verifyToken;

class SocketServerCore extends EventEmitter {
  constructor(socketServer) {
    super();
    this.socketServer = socketServer;
    this.namespaceIdentifier = '';
    this.namespace = undefined;
  }

  log(format, ...args) {
    const objectLabel = this.constructor.name;
    logger.info(objectLabel + ' - ' + format, ...args);
  }

  error(format, ...args) {
    const objectLabel = this.constructor.name;
    logger.error(objectLabel + ' - ' + format, ...args);
  }

  localPing() {
    this.emit('pingResponse', `${this.constructor.name} responded to local ping`);
  }

  authenticateConnection(socket) {
    if (socket.handshake.query && socket.handshake.query.token) {
      try {
        socket.decodedToken = verifyToken(socket.handshake.query.token)
      } catch (e) {
        this.error(`an authentication error occurred %O`, e);
        this.log(`token provided: %O`, socket.handshake.query.token);
      }
    } else {
      throw new Error('no credentials provided');
    }
  }

  addSocketEvents(socket) {
    // override in subclasses
  }

  connect() {
    this.log(`connecting...`);
    this.namespace = this.socketServer.of(`/${this.namespaceIdentifier}`);
    this.emit('namespaceCreated', this.namespaceIdentifier);

    this.namespace.on('connection', (socket) => {
      this.authenticateConnection(socket);
      this.log(`a client connected: %O`, socket.decodedToken);
      this.emit('clientConnected', socket.id);

      let user = {
        userId: socket.decodedToken.userId,
        username: socket.decodedToken.username,
        roles: socket.decodedToken.roles
      };

      socket.on('disconnect', () => {
        this.log(`user disconnected: %O`, user);
        this.emit('userLeft', {clientId: socket.client.id}, user);
        // this.socketServer.of('events').emit('userStatus', {username: user.name, message: 'left'});
      });

      socket.on('penguin', (fn) => { // because 'ping' is a reserved word, apparently...?
        this.log(`received ping: %O`, socket.handshake.query);
        fn({message: 'ping response from StateServer'});
      });
      this.addSocketEvents(socket);
    });

  }

  disconnect() {
    const connectedNamespaceSockets = Object.keys(this.namespace.connected);
    connectedNamespaceSockets.forEach(socketId => {
      this.namespace.connected[socketId].disconnect();
    });
    this.namespace.removeAllListeners();
    delete this.socketServer.nsps[`/${this.namespaceIdentifier}`];
  }
}

module.exports = SocketServerCore;
