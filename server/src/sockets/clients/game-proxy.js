const EventEmitter = require('events');
const SocketClient = require('socket.io-client');
const uuid = require('uuid/v1');
const logger = require('../../logger');
const rulesNamespaceIdentifier = 'rules';

class GameProxy extends EventEmitter {

  makePromiseBasedCall(socket, eventName, ...args) {
    return new Promise(resolve => {
      // creating this array so that we can flexibly insert 'args'
      // between the required params and the callback, since the
      // callback is conventionally the last argument
      let messageParams = [eventName, this.gameId];
      if (args !== undefined && args.length > 0) {
        messageParams = messageParams.concat(args);
      }
      messageParams.push(response => {
        resolve(response);
      });
      logger.info(`GameProxy - makePromisedBasedCall. messageParams: %o`, messageParams);
      socket.emit(...messageParams);
    });
  }

  constructor(options) {
    super();
    this.namespaceIdentifier = rulesNamespaceIdentifier; // used by SocketServerCore
    this.initialGameData = undefined;
    this.gameId = undefined;

    const proxy = this;
    let socket = undefined;
    let active = false;
    let paused = false;
    let pendingState = undefined;

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
          socket.on('gameOver', finalGameData => {
            logger.info(`GameProxy '%s' received gameOver socket event: %o`, proxy.gameId, finalGameData);
            proxy.emit('gameOver', finalGameData);
          })
        });

      });
    }

    this.getGameParameters = () => {
      return this.makePromiseBasedCall(socket, 'gameParamsRequest');
    };

    this.getGameData = () => {
      return this.makePromiseBasedCall(socket, 'gameDataRequest');
    };

    this.start = playerList => {
      logger.info(`GameProxy start: %o`, playerList);
      active = true;
      return this.makePromiseBasedCall(socket, 'startGame', playerList)
        .then(gameData => {
          logger.info(`GameProxy - startGame response: %o`, gameData);
          return gameData;
        })
    };

    this.pause = () => {
      paused = true;
      return this.makePromiseBasedCall(socket, 'pauseGame');
    };

    this.resume = () => {
      paused = false;
      pendingState = undefined;
      return this.makePromiseBasedCall(socket, 'resumeGame');
    };

    this.advanceFrame = (frameResponseData) => {
      logger.info(`GameProxy - advanceFrame. frameResponseData: %o`, frameResponseData);
      return this.makePromiseBasedCall(socket,'advanceFrame', frameResponseData);
    };

    this.stop = () => {
      active = false;
      return this.makePromiseBasedCall(socket, 'stopGame');
    };

    this.connect = createConnection;

    this.isStoppedOrPaused = () => paused || !active;

    this.setPendingState = gameState => pendingState = gameState;

    this.getPendingState = () => pendingState;
  }

}

module.exports = GameProxy;
