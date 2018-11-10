import * as CoreSocketConnection from './core-socket-connection'

export function createEventConnection() {
  const namespaceIdentifier = 'event';
  const coreConnection = CoreSocketConnection.createCoreSocketConnection();

  let socket;

  const createConnection = async (authToken) => {
    socket = await coreConnection.createConnection(namespaceIdentifier, authToken);
    addSocketEvents(socket);
  };

  const addSocketEvents = (socket) => {
    socket.on('clientConnected', (...data) => {
      console.log(`a client connected to the '${namespaceIdentifier}' server`, data);
      coreConnection.notify('clientConnected', ...data);
      if(data.length > 1 && data[1].loginType === 'player') {
        coreConnection.dispatchEvent('playerJoined', data[1]);
      }
    })
    socket.on('clientDisconnected', (...data) => {
      console.log(`a client disconnected from the '${namespaceIdentifier}' server`, data);
      if(data.length > 1 && data[1].loginType === 'player') {
        coreConnection.dispatchEvent('playerLeft', data[1]);
      }
    })
  };

  const getPlayerList = () => {
    return new Promise((resolve) => {
      socket.emit('playerListRequest', function (response) {
        resolve(response.players);
      });
    });
  };

  return {
    objectName: 'GameEventConnection',
    createConnection: createConnection,
    disconnect: coreConnection.disconnect,
    ping: coreConnection.ping,
    on: coreConnection.on,
    getPlayerList: getPlayerList
  };
}
