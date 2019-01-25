const SocketServerCore = require('./socket-server-core');
const sanitizeToken = require('../../authentication').sanitizeToken;
const uuid = require('uuid/v1');

const rulesNamespaceIdentifier = 'rules';

class RulesServer extends SocketServerCore {
  constructor(socketServer) {
    super(socketServer);
    this.namespaceIdentifier = rulesNamespaceIdentifier; // used by SocketServerCore
  }

  addSocketEvents(socket) {
    socket.on('rulesEngineListRequest', (fn) => {
        const engines = ['maresy', 'dotes', 'dosey', 'little', 'lamsey-divey'];
        fn({engines: engines});
    })
  }
}

module.exports = RulesServer;
