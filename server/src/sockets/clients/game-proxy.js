const EventEmitter = require('events');
const SocketClient = require('socket.io-client');
const uuid = require('uuid/v1');
const logger = require('../../logger');
const rulesNamespaceIdentifier = 'rules';

class GameProxy extends EventEmitter {

  makePromiseBasedCall(socket, eventName) {
    return new Promise(resolve => {
      socket.emit(eventName, this.gameId, response => {
        resolve(response);
      });
    });
  }

  constructor(options) {
    super();
    this.namespaceIdentifier = rulesNamespaceIdentifier; // used by SocketServerCore
    this.initialGameData = undefined;
    this.gameId = undefined;

    const proxy = this;
    let socket = undefined;

    function createConnection() {
      return new Promise((resolve, reject) => {
        const serverAddress = options.engine;
        socket = SocketClient(`http://${serverAddress}`, {path: `/${rulesNamespaceIdentifier}`})
        socket.on('connect', () => {
          console.log(`GameProxy connected!`);
          socket.emit('newGameRequested', options, function (response) {
            logger.info(`GameProxy - received new game object: %o`, response);
            proxy.initialGameData = response.gameData;
            proxy.gameId = response.gameData.id;
            resolve(proxy);
          });
        });

      });
    }

    this.getGameParameters = () => {
      return this.makePromiseBasedCall(socket, 'gameParamsRequest');
    };

    this.connect = createConnection;
  }

}

module.exports = GameProxy;
