const SocketServerCore = require('./socket-server-core');
const eventNamespaceIdentifier = 'event';

class EventServer extends SocketServerCore {

  constructor(socketServer) {
    super(socketServer);
    this.namespaceIdentifier = eventNamespaceIdentifier; // used by SocketServerCore
  }

  addSocketEvents(socket) {
  }

  // add local event handlers here
}

module.exports = EventServer;
