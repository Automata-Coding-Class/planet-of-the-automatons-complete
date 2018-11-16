import * as CoreSocketConnection from './core-socket-connection'


export function createStateConnection() {
  const namespaceIdentifier = 'state';
  const coreConnection = CoreSocketConnection.createCoreSocketConnection();

  let socket;

  const createConnection = async (authToken) => {
    socket = await coreConnection.createConnection(namespaceIdentifier, authToken);
    addSocketEvents(socket);
  };

  const addSocketEvents = (socket) => {
    socket.on('newGameCreated', gameParameters => {
      coreConnection.dispatchEvent('newGameCreated', gameParameters);
    });
  }

  const getGameParameters = () => {
    return new Promise((resolve) => {
      socket.emit('gameParamsRequest', function (gameParameters) {
        console.log(`gameParameters response:`, gameParameters);
        resolve(gameParameters);
      });
    });
  };

  const getGameData = () => {
    return new Promise((resolve) => {
      console.log(`socket:`, socket);
      return socket.emit('gameDataRequest', function (gameData) {
        console.log(`gameData response:`, gameData);
        resolve(gameData);
      });
    });
  };

  const requestNewGame = (options) => {
    return socket.emit('newGameRequest', options);
  };

  return {
    objectName: 'StateMachineConnection',
    createConnection: createConnection,
    disconnect: coreConnection.disconnect,
    ping: coreConnection.ping,
    getGameParameters: getGameParameters,
    requestNewGame: requestNewGame,
    getGameData: getGameData,
    on: coreConnection.on
  };
}

// function StateConnection() {
// // possible event handlers
// this.onNotificationHandler = undefined;
//
// // eslint-disable-next-line
// console.log('creating a new StateConnection object');
// this.socket = null;
// this.eventListeners = new Map();
// this.createConnection = (user) => {
//   return new Promise((resolve) => {
//
//     const hostAddress = 'http://localhost:3000';
//     const namespace = 'state';
//     // eslint-disable-next-line
//     console.log(`connecting to host '${hostAddress}'...`);
//
//     const socket = SocketClient(`${hostAddress}/${namespace}`);
//
//     socket.on('notification', (notification) => {
//       // eslint-disable-next-line
//       console.log('StateConnection received a notification', notification);
//       if (this.onNotificationHandler !== undefined) {
//         this.onNotificationHandler(notification);
//       }
//     });
//
//     socket.on('connection-list', (connectionList) => {
//       // eslint-disable-next-line
//       this.dispatchEvent('onConnectionListReceived', connectionList);
//     });
//
//     socket.on('gameStarted', () => {
//       this.dispatchEvent('gameStarted', {});
//
//     });
//
//     socket.on('gameStopped', () => {
//       this.dispatchEvent('gameStopped', {});
//
//     });
//
//     socket.on('gameStateUpdate', (updatedGameState) => {
//       this.dispatchEvent('gameStateUpdated', updatedGameState);
//
//     });
//
//     socket.on('playerJoined', (data) => {
//       console.log(`state-connection: player joined:`, data);
//       this.dispatchEvent('playerJoined', data.newPlayer, data.updatedGameState);
//     });
//
//     socket.on('playerLeft', (data) => {
//       console.log(`state-connection: player left:`, data);
//       this.dispatchEvent('playerLeft', data.departingPlayer, data.updatedGameState);
//     });
//
//     socket.on('connect', () => {
//       // eslint-disable-next-line
//       console.log(`StateConnection connected to host '${hostAddress}/${namespace}'`);
//       socket.emit('loginData', user);
//     });
//
//     socket.on('disconnect', () => {
//       // eslint-disable-next-line
//       console.log(`StateConnection: disconnected from host '${hostAddress}/${namespace}'`);
//     });
//
//     resolve(socket);
//   });
// };
// this.dispatchEvent = async (eventType, ...args) => {
//   if (this.eventListeners.has(eventType)) {
//     this.eventListeners.get(eventType).map(handler => handler(...args));
//   }
// };
// }

// StateConnection.prototype.connect = function connect(user) {
//   // eslint-disable-next-line
//   console.log(`StateConnection attempting connection with user`, user);
//   this.createConnection(user)
//     .then(result => {
//       this.socket = result;
//       this.dispatchEvent('connected');
//     });
// };
//
// StateConnection.prototype.getGameParameters = function () {
//   return new Promise((resolve) => {
//     this.socket.emit('gameParamsRequest', function (result) {
//       resolve(result);
//     });
//   });
// };
//
// StateConnection.prototype.getCurrentGameState = function () {
//   return new Promise((resolve) => {
//     this.socket.emit('gameStateRequest', function (result) {
//       resolve(result);
//     });
//   });
// };
//
// StateConnection.prototype.addEventListener = function addEventLister(eventType, listener) {
//   if (!this.eventListeners.has(eventType)) {
//     this.eventListeners.set(eventType, []);
//   }
//   const listenerArray = this.eventListeners.get(eventType);
//   if (listenerArray.indexOf(listener) === -1) {
//     listenerArray.push(listener);
//   }
// };

// export default StateConnection;
