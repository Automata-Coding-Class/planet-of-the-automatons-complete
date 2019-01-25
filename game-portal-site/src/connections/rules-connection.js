import * as CoreSocketConnection from './core-socket-connection'


export function createRulesConnection() {
  const namespaceIdentifier = 'rules';
  const coreConnection = CoreSocketConnection.createCoreSocketConnection();

  let socket;

  const createConnection = async (authToken) => {
    socket = await coreConnection.createConnection(namespaceIdentifier, authToken);
    addSocketEvents(socket);
  };

  const addSocketEvents = (socket) => {
  };

  const getAvailableRulesEngines = () => {
    return new Promise((resolve) => {
      socket.emit('rulesEngineListRequest', function (response) {
        resolve(response.engines);
      });
    });
  };


  return {
    objectName: 'RulesEngineConnection',
    createConnection: createConnection,
    disconnect: coreConnection.disconnect,
    ping: coreConnection.ping,
    getAvailableRulesEngines: getAvailableRulesEngines,
    on: coreConnection.on
  };

}

