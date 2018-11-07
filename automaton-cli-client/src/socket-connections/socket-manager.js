const logger = require('../logger');
const createStateConnection = require('./state-connection');

module.exports = function createSocketManager(serverAddress) {

  const connections = {
    stateConnection: createStateConnection(serverAddress)
  };

  const openAllConnections = async function(authToken) {
    logger.info(`will open all connections using token '%s'`, authToken);
    await connections.stateConnection.createConnection(authToken);
    return true;
  }
  return {
    openAllConnections: openAllConnections
  }
}
