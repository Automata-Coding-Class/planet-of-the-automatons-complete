const SocketServerCore = require('./socket-server-core');
const sanitizeToken = require('../../authentication').sanitizeToken;
const eventNamespaceIdentifier = 'event';

class EventServer extends SocketServerCore {

  constructor(socketServer) {
    super(socketServer);
    this.namespaceIdentifier = eventNamespaceIdentifier; // used by SocketServerCore
  }

  addSocketEvents(socket) {
    socket.on('playerListRequest', (fn) => {
      const players = Object.keys(socket.nsp.sockets).reduce((playerList, socketKey) => {
        const token = socket.nsp.sockets[socketKey].decodedToken;
        if(token !== undefined && token.loginType === 'player') {
          playerList.push(sanitizeToken(token));
        }
        return playerList;
      }, []);
      fn({players: players});
    })
  }

  beforePublish(eventName, ...args) {
    args.unshift(new Date());
    return args;
  }

  // add local event handlers here
}

module.exports = EventServer;
