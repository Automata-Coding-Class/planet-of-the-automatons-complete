const createCoreSocketConnection = require('./core-socket-connection');
const playerBot = require('../../bot');

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
    socket.on('newFrame', frame => {
      console.log(`received a new frame:`, frame);
      if(frame.data === undefined) {
        socket.emit('frameResponse', {frameId: frame.frameId});
      } else {
        socket.emit('frameResponse', {frameId: frame.frameId, response: playerBot.processFrame(frame)});
      }
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
