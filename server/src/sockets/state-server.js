const SocketServerCore = require('./socket-server-core');
const stateNamespaceIdentifier = 'state';

class StateServer extends SocketServerCore {

  constructor(socketServer) {
    super(socketServer);
    this.namespaceIdentifier = stateNamespaceIdentifier; // used by SocketServerCore
  }

  addSocketEvents(socket) {
    socket.on('rulesEngineListRequest', (fn) => {
      this.emit('availableRulesEnginesRequested');
    });

    socket.on('newGameRequest', (options) => {
      this.log(`newGameRequest: %o`, options);
      this.emit('newGameRequested', {rows: options.rows, columns: options.columns, duration: options.duration, percentAssets: options.percentAssets/100, engine: options.engine})
    });

    socket.on('startGame', request => {
      this.log('startGame event received');
      this.emit('startGame', request);
    });

    socket.on('pauseGame', request => {
      this.log('pauseGame event received');
      this.emit('pauseGame', request);
    });

    socket.on('resumeGame', request => {
      this.log('resumeGame event received');
      this.emit('resumeGame', request);
    });

    socket.on('stopGame', request => {
      this.log('stopGame event received');
      this.emit('stopGame', request);
    });

    socket.on('gameParamsRequest', (gameId, fn) => {
      try {
        this.log(`gameParamsRequest for game ${gameId}`);
        this.emit('gameParamsRequest', {gameId: gameId, callback: fn});
      } catch (e) {
        this.error(`gamesParamsRequest failed: %O`, e);
      }
    });

    socket.on('gameDataRequest', (gameId, fn) => {
      this.emit( 'gameDataRequested', {gameId, callback: fn});
      // this.emit( 'gameDataRequested', (gameData) => {
      //   fn(gameData);
      // });
    })
  }

  newGameHandler(gameData) {
    this.namespace.emit('newGameCreated', gameData);
  }

  broadcastAvailableRulesEnginesList(engines) {
    this.namespace.emit('availableRulesEnginesUpdated', engines);
  }

  broadcastGameState(gameData) {
    this.namespace.emit('gameStateUpdated', gameData);
  }
}

module.exports = StateServer;
