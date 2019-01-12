const SocketClient = require('socket.io-client');
const logger = require('../logger');

module.exports = function createCoreSocketConnection(serverAddress) {
  const eventListeners = new Map();

  let socket;
  const createConnection = async function (namespace, authToken) {
    logger.info(`connecting to host address '${serverAddress}' with namespace '${namespace}'`);
    socket = await SocketClient(`${serverAddress}/${namespace}`
      , {query: {token: authToken}}
      );
    socket.on('connect', () => {
      logger.info(`(${namespace})socket connection event received`);
    })
    return socket;
  };

  const disconnect = () => {
    if (socket && socket.connected) {
      logger.info(`closing socket`);
      socket.close();
    }
    socket = undefined;
  };

  const ping = () => {
    logger.info(`pinging the state machine socket...`);
    return new Promise((resolve) => {
      socket.emit('penguin', function (response) {
        resolve(response);
      });
    });
  };

  const addEventListener = function (eventType, listener) {
    if (!eventListeners.has(eventType)) {
      eventListeners.set(eventType, []);
    }
    const listenerArray = eventListeners.get(eventType);
    if (!listenerArray.includes(listener)) {
      listenerArray.push(listener);
    }
  };

  const removeEventListener = function (eventType, listener) {
    if (eventListeners.has(eventType)) {
      const listenerArray = eventListeners.get(eventType);
      if (listenerArray !== undefined && listenerArray.includes(listener)) {
        listenerArray.splice(listenerArray.indexOf(listener), 1);
      }
    }
  };

  const dispatchEvent = async function(eventType, ...args) {
    if (eventListeners.has(eventType)) {
      eventListeners.get(eventType).map(handler => handler(...args));
    }
  };


  return {
    objectName: 'CoreSocketConnection',
    createConnection: createConnection,
    disconnect: disconnect,
    ping: ping,
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    on: addEventListener,
    dispatchEvent: dispatchEvent
  };
}
