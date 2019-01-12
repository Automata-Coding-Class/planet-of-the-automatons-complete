const SocketServerCore = require('./socket-server-core');
const stateNamespaceIdentifier = 'state';

class StateServer extends SocketServerCore {

  constructor(socketServer) {
    super(socketServer);
    this.namespaceIdentifier = stateNamespaceIdentifier; // used by SocketServerCore
  }

  addSocketEvents(socket) {
    socket.on('newGameRequest', (options) => {
      this.log(`newGameRequest: %o`, options);
      this.emit('newGameRequested', {rows: options.rows, columns: options.columns})
    });

    socket.on('startGame', () => {
      this.log('startGame event received');
      this.emit('startGame');
    });

    socket.on('pauseGame', () => {
      this.log('pauseGame event received');
      this.emit('pauseGame');
    });

    socket.on('resumeGame', () => {
      this.log('resumeGame event received');
      this.emit('resumeGame');
    });

    socket.on('stopGame', () => {
      this.log('stopGame event received');
      this.emit('stopGame');
    });

    socket.on('gameParamsRequest', (fn) => {
      try {
        this.log(`gameParamsRequest`);
        this.emit('gameParamsRequest', {callback: fn});
      } catch (e) {
        this.error(`gamesParamsRequest failed: %O`, e);
      }
    });

    socket.on('gameStateRequest', (fn) => {
      try {
        fn(this.gameState.getCurrentState());
      } catch (e) {
        this.error(JSON.stringify(e));
      }
    });

    socket.on('gameDataRequest', (fn) => {
      this.emit(  'gameDataRequested', (gameData) => {
        fn(gameData);
      });
    })
  }

  newGameHandler(gameData) {
    this.namespace.emit('newGameCreated', gameData);
  }

  broadcastGameState(gameData) {
    this.namespace.emit('gameStateUpdated', gameData);
  }
}

module.exports = StateServer;
