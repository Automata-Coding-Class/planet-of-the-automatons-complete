const createCoreSocketConnection = require('./core-socket-connection');


module.exports = function createEventConnection(serverAddress) {
  const namespace = 'event';
  const coreConnection = createCoreSocketConnection(serverAddress);

  let socket;

  const createConnection = async (authToken) => {
    socket = await coreConnection.createConnection(namespace, authToken);
    addSocketEvents(socket);
  };

  const addSocketEvents = (socket) => {
    socket.on('newGameCreated', gameParameters => {
      coreConnection.dispatchEvent('newGameCreated', gameParameters);
    });
  };

  return {
    objectName: 'StateMachineConnection',
    createConnection: createConnection,
    disconnect: coreConnection.disconnect,
    ping: coreConnection.ping,
    on: coreConnection.on
  };
}
