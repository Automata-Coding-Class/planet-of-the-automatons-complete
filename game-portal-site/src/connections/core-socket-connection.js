const SocketClient = require('socket.io-client');

export function createCoreSocketConnection() {
  const eventListeners = new Map();

  const createConnection = async function (namespace, authToken) {
    const hostAddress = process.env.VUE_APP_SOCKET_URL || 'http://localhost:3000';
    console.log(`connecting to host address '${hostAddress}' with namespace '${namespace}'`);
    const socket = await SocketClient(`${hostAddress}/${namespace}`
      , {query: {token: authToken}}
      );
    socket.on('connect', () => {
      console.log(`(${namespace})socket connection event received`);
    })
    return socket;
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

  const dispatchEvent = async function(eventType, ...args) {
    if (eventListeners.has(eventType)) {
      eventListeners.get(eventType).map(handler => handler(...args));
    }
  };


  return {
    objectName: 'CoreSocketConnection',
    createConnection: createConnection,
    addEventListener: addEventListener,
    on: addEventListener,
    dispatchEvent: dispatchEvent
  };
}
