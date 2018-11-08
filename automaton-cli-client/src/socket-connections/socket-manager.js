const logger = require('../logger');
const createEventConnection = require('./event-connection');

module.exports = function createSocketManager(serverAddress) {

  const connections = {
    eventConnection: createEventConnection(serverAddress)
  };
  const openAllConnections = async function(authToken) {
    logger.info(`will open all connections using token '%s'`, authToken);
    await connections.eventConnection.createConnection(authToken);
    return true;
  }
  return {
    openAllConnections: openAllConnections
  }
}
