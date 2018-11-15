const SocketServerCore = require('./socket-server-core');
const stateNamespaceIdentifier = 'state';

class StateServer extends SocketServerCore {

  constructor(socketServer) {
    super(socketServer);
    this.namespaceIdentifier = stateNamespaceIdentifier; // used by SocketServerCore
  }

  addSocketEvents(socket) {
    socket.on('newGameRequest', (options) => {
      this.emit('newGameRequested', {rows: options.rows, columns: options.columns})
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
  }

  newGameHandler(gameParameters, gameState) {
    this.namespace.emit('newGameCreated', { parameters: gameParameters, layout: gameState });
  }
}

module.exports = StateServer;
