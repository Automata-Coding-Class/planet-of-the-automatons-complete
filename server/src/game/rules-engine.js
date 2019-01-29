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

function instantiateHttpServer() {
  const server = http.createServer(function (req, res) {
    // res.json({status: 'running'});
    res.writeHead(200, {'Content-Type': 'application/JSON'});
    res.end(JSON.stringify({status: 'okay', name: engineName}));
  });
  const port = getRulesEnginePort();
  server.listen(port);
  return server;
}

const createNewRulesEngine = function() {
  const server = instantiateHttpServer();
  const socket = io(server, {path: '/rules'});
  const namespace = socket.of(namespaceIdentifier);
  socket.on('connection', (client) => {
    console.log(`RulesEngine: someone connected!`);
    client.on('newGameRequested', options => {
      console.log(`RulesEngine has received a new game request:`, options);
    })
  });

  return {};
};

module.exports = createNewRulesEngine;

