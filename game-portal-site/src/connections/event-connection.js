import * as CoreSocketConnection from './core-socket-connection'

export function createEventConnection() {
  const namespaceIdentifier = 'event';
  const coreConnection = CoreSocketConnection.createCoreSocketConnection();

  let socket;

  const createConnection = async (authToken) => {
    console.log(`authToken:`, authToken);
    socket = await coreConnection.createConnection(namespaceIdentifier, authToken);
    addSocketEvents(socket);
    console.log(`socket`, socket);
  };

  const addSocketEvents = (socket) => {
    socket.on('clientConnected', (...data) => {
      console.log(`a client connected to the '${namespaceIdentifier}' server`, data);
      coreConnection.notify('clientConnected', ...data);
    })
  };

  return {
    objectName: 'GameEventConnection',
    createConnection: createConnection,
    disconnect: coreConnection.disconnect,
    ping: coreConnection.ping,
    on: coreConnection.on
  };
}
