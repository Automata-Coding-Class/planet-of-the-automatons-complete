const EventEmitter = require('events');
const SocketClient = require('socket.io-client');
const uuid = require('uuid/v1');
const logger = require('../../logger');
const rulesNamespaceIdentifier = 'rules';

class GameProxy extends EventEmitter {

  constructor(options) {
    super();
    this.id = uuid();
    this.namespaceIdentifier = rulesNamespaceIdentifier; // used by SocketServerCore

    async function createConnection() {
      const serverAddress = options.engine;
      const socket = await SocketClient(`http://${serverAddress}`, {path: `/${rulesNamespaceIdentifier}`});
      socket.on('connect', () => {
        console.log(`GameProxy connected!`);
        socket.emit('newGameRequested', Object.assign(options, {id: this.id}));
      });
    }
    this.connect = createConnection;
  }

  // addSocketEvents(socket) {
  //   const dns = require('dns');
  //   socket.on('rulesEngineListRequest', (fn) => {
  //     const os = require('os');
  //     console.log(`hostname:`, os.hostname());
  //     getEngineList()
  //       .then(rulesEnginesList => {
  //         fn({engines: rulesEnginesList });
  //       });
  //   })
  // }

}

module.exports = GameProxy;
