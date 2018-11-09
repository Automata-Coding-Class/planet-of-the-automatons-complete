const SocketClient = require('socket.io-client');

export function createCoreSocketConnection() {
  const eventListeners = new Map();

  let socket;
  let namespaceIdentifier = '';

  const createConnection = async function (namespace, authToken) {
    const hostAddress = process.env.VUE_APP_SOCKET_URL || 'http://localhost:3000';
    console.log(`connecting to host address '${hostAddress}' with namespace '${namespace}'`);
    socket = await SocketClient(`${hostAddress}/${namespace}`
      , {query: {token: authToken}}
      );
    socket.on('connect', () => {
      console.log(`(${namespace})socket connection event received`);
    })
    return socket;
  };

  const disconnect = () => {
    if(socket && socket.connected) {
      console.log(`closing socket`);
      socket.close();
    }
    socket = undefined;
  };

  const ping = () => {
    console.log(`pinging the '${namespaceIdentifier}' socket...`);
    return new Promise((resolve) => {
      socket.emit('penguin', function (response) {
        resolve(response);
      });
    });
  };

  const notify = function(eventType, ...args) {
    const timestamp = args.length > 0 && !isNaN(Date.parse(args[0])) ?
      new Date(Date.parse(args[0])) :
      undefined;


    dispatchEvent('notify', {type: eventType, timestamp: timestamp, payload: args.slice(1)});
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
    disconnect: disconnect,
    notify: notify,
    addEventListener: addEventListener,
    on: addEventListener,
    dispatchEvent: dispatchEvent
  };
}
