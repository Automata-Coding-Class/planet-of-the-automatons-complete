const SocketClient = require('socket.io-client');

module.exports = function createCoreSocketConnection(serverAddress) {
  const eventListeners = new Map();

  let socket;
  const createConnection = async function (namespace, authToken) {
    console.log(`connecting to host address '${serverAddress}' with namespace '${namespace}'`);
    socket = await SocketClient(`${serverAddress}/${namespace}`
      , {query: {token: authToken}}
      );
    socket.on('connect', () => {
      console.log(`(${namespace})socket connection event received`);
    })
    return socket;
  };

  const disconnect = () => {
    if (socket && socket.connected) {
      console.log(`closing socket`);
      socket.close();
    }
    socket = undefined;
  };

  const ping = () => {
    console.log(`pinging the state machine socket...`);
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
