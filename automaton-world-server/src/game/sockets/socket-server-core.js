const logger = require('../../logger');
const EventEmitter = require('events');
const Authentication = require('../../authentication');
const verifyToken = Authentication.verifyToken;
const decodeToken = Authentication.decodeToken;
const sanitizeToken = Authentication.sanitizeToken;

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

  authenticateConnection(socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
      try {
        socket.decodedToken = verifyToken(socket.handshake.query.token);
        if(socket.nsp.log && socket.nsp.server) {
          socket.nsp.log.call(socket.nsp.server, `authentication succeeded: %o`, socket.decodedToken);
        } else {
          logger.info(`authentication succeeded: %o`, socket.decodedToken);
        }
        if (socket.decodedToken) {
          next();
        }
      } catch (e) {
        const brokenToken = sanitizeToken(decodeToken(socket.handshake.query.token));
        const err = new Error(`authentication failed for token '${JSON.stringify(brokenToken)}': ${JSON.stringify(e)}`);
        if(socket.nsp.log && socket.nsp.server) {
          socket.nsp.log.call(`Authentication error: %o`, err);
        } else {
          logger.info(`Authentication error: %o`, err);
        }
        next(err);
      }
    } else {
      const err = new Error('no credentials provided');
      if(socket.nsp.log && socket.nsp.server) {
        socket.nsp.log.call(`Authentication error: %o`, err);
      } else {
        logger.info(`Authentication error: %o`, err);
      }
      next(err);
    }
  }

  addSocketEvents(socket) {
    // override in subclasses
  }

  beforePublish(eventName, ...args) {
    // override in subclasses
    return args;
  }

  publishEvent(eventName, ...args) {
    if (this.namespace !== undefined) {
      args = this.beforePublish(eventName, ...args);
      this.namespace.emit(eventName, ...args);
    }
  }

  connect() {
    this.log(`connecting...`);
    this.namespace = this.socketServer.of(`/${this.namespaceIdentifier}`);
    // pass the required enriched logging objects to the new namespace, so that they are accessible from the authentication middleware function
    this.namespace.log = this.log;
    this.namespace.error = this.error;
    this.namespace.server = this;
    this.namespace.use(this.authenticateConnection)
    this.emit('namespaceCreated', this.namespaceIdentifier);

    this.namespace.on('connection', (socket) => {
      this.log(`a client connected: %O`, socket.decodedToken);
      let user = sanitizeToken(socket.decodedToken)
      this.publishEvent('clientConnected', user);


      socket.on('disconnect', () => {
        this.log(`user disconnected: %O`, user);
        this.emit('userLeft', user);
        this.publishEvent('clientDisconnected', user);
        // this.socketServer.of('events').emit('userStatus', {username: user.name, message: 'left'});
      });

      socket.on('penguin', (fn) => { // because 'ping' is a reserved word, apparently...?
        this.log(`received ping: %O`, socket.handshake.query);
        fn({message: 'ping response from StateServer'});
      });

      socket.on('connect_failed', (e) => {
        logger.info(`connect failed: %o`, e);
      });
      socket.on('reconnect_failed', (e) => {
        logger.info(`reconnect failed: %o`, e);
      });
      socket.on('error', (e) => {
        logger.info(`socket error: %o`, e);
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
