const SocketServerCore = require('../sockets/socket-server-core');
const http = require('http');
const io = require('socket.io');
const namespaceIdentifier = '/rules';
const engineName = 'Internal Default';

function getRulesEnginePort() {
  const rawPortValue = process.env.RULES_ENGINE_PORT || '5000';
  const port = parseInt(rawPortValue, 10);
  if (isNaN(port)) { // named pipe
    return rawPortValue;
  }
  if (port >= 0) { // port number
    return port;
  }
  return false;
}


function instantiateSocketServer() {
  const server = http.createServer(function (req, res) {
    // res.json({status: 'running'});
    res.writeHead(200, {'Content-Type': 'application/JSON'});
    res.end(JSON.stringify({status: 'okay', name: engineName}));
  });
  const port = getRulesEnginePort();
  server.listen(port);
  return require('socket.io').listen(server);
}

class RulesEngine extends SocketServerCore {

  constructor() {
    const _socketServer = instantiateSocketServer();
    super(_socketServer);
    this.getSocketServer = function () {
      return _socketServer
    };
    this.namespaceIdentifier = namespaceIdentifier; // used by SocketServerCore
  }

  addSocketEvents(socket) {
  }

}

module.exports = RulesEngine;


// const socketManager = createSocketManager(`http://${options.serverAddress}:${options.serverPort}`);
// return socketManager.openAllConnections(/*data.token*/)
//   .then(() => {
//     return socketManager;
//   })

