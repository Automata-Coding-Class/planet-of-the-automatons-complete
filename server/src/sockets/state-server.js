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
      this.emit('newGameRequested', {rows: options.rows, columns: options.columns, duration: options.duration, engine: options.engine})
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

    socket.on('gameParamsRequest', (gameId, fn) => {
      try {
        this.log(`gameParamsRequest for game ${gameId}`);
        this.emit('gameParamsRequest', {gameId: gameId, callback: fn});
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

  broadcastAvailableRulesEnginesList(engines) {
    this.namespace.emit('availableRulesEnginesUpdated', engines);
  }

  broadcastGameState(gameData) {
    this.namespace.emit('gameStateUpdated', gameData);
  }
}

module.exports = StateServer;
