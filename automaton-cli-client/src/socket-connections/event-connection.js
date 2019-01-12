const createCoreSocketConnection = require('./core-socket-connection');
const playerBot = require('../../bot');
const logger = require('../logger');

module.exports = function createEventConnection(serverAddress) {
  const namespace = 'event';
  const coreConnection = createCoreSocketConnection(serverAddress);

  let socket;
  let paused = false;
  let pendingFrame = undefined;

  const createConnection = async (authToken) => {
    socket = await coreConnection.createConnection(namespace, authToken);
    addSocketEvents(socket);
  };

  function processFrameAndRespond(socket, frame) {
    const response = playerBot.processFrame(frame);
    logger.info(`responding to frame id '${frame.frameId}' with ${JSON.stringify(response)}`);
    socket.emit('frameResponse', {frameId: frame.frameId, response: response});
  }

  function initializeGameState() {
    paused = false;
    pendingFrame = undefined;
  }

  const addSocketEvents = (socket) => {
    socket.on('newGameCreated', gameParameters => {
      logger.info('newGameCreated: %s', gameParameters);
      initializeGameState();
      coreConnection.dispatchEvent('newGameCreated', gameParameters);
    });
    socket.on('newFrame', frame => {
      logger.info(`received a new frame: %o`, frame);
      if(frame.data === undefined) {
        socket.emit('frameResponse', {frameId: frame.frameId});
      } else if(paused) {
        logger.info(`paused, will not process frame`);
        pendingFrame = frame;
      } else {
        processFrameAndRespond(socket, frame);
      }
    });
    socket.on('gamePaused', () => {
      logger.info(`game paused`);
      paused = true;
    });
    socket.on('gameResumed', () => {
      logger.info(`game resumed`);
      paused = false;
      if(pendingFrame !== undefined) {
        processFrameAndRespond(socket, pendingFrame);
        pendingFrame = undefined;
      }
    });
    socket.on('gameStopped', () => {
      logger.info(`game stopped`);
      paused = false;
      if(pendingFrame !== undefined) {
        processFrameAndRespond(socket, pendingFrame);
        pendingFrame = undefined;
      }
    })
  };

  return {
    objectName: 'StateMachineConnection',
    createConnection: createConnection,
    disconnect: coreConnection.disconnect,
    ping: coreConnection.ping,
    on: coreConnection.on
  };
}
