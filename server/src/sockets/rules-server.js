const SocketServerCore = require('./socket-server-core');
const http = require('http');
const NetScan = require('netscan');
const scanner = new NetScan();
const network = require('network');
const io = require('socket.io');

const rulesNamespaceIdentifier = 'rules';
const ipScanRangeSize = process.env.IP_SCAN_RANGE_SIZE !== undefined ? process.env.IP_SCAN_RANGE_SIZE : 100;
const ipPattern = /^(\d+)\.(\d+)\.(\d+)\.(\d+)/;

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
// Send index.html to all requests
  const server = http.createServer(function(req, res) {
    res.json({status: 'running'});
  });
  const port = getRulesEnginePort();
  server.listen(port);
  return require('socket.io').listen(server);
}

function getStartingIpAddress() {
  // first figure out the current machine's IP address, and gateway if possible
  return new Promise((resolve, reject) => {
    network.get_active_interface((err, netInterface) => {
      if (err) {
        throw err;
      } else {
        console.log(`netInterface:`, netInterface);
        if (netInterface.gateway_ip !== undefined) {
          const match = ipPattern.exec(netInterface.gateway_ip);
          resolve(`${match[1]}.${match[2]}.${match[3]}.${(parseInt(match[4]) + 1)}`);
        } else {
          const match = ipPattern.exec(netInterface.ip_address);
          resolve(`${match[1]}.${match[2]}.${match[3]}.0`);
        }
      }
    });
  });
}

function getEngineList() {
  return getStartingIpAddress()
    .then(startingIp => {
      const scannerOptions = {
        protocol : ['http'],
        ports: [3000], //[80, 90, 443, 1337],
        codes: [200, 201, 202], //only count it if a 200 comes back,
        errors : [], //like 'ETIMEDOUT'
        paths: '/api/helloworld' || [string], // optional to have it hit a specific endpoint
        headers: {}, // include the following headers in all request so you can do auth or something,
        timeout: 500, //10000, //10 seconds timeout)
        ignoreResponse : true //tells it to not return the body as part of the results


      };
      const ipSegments = ipPattern.exec(startingIp).slice(1,5).map(segment => {
        return parseInt(segment);
      });
      Object.assign(scannerOptions, {
        octet0: [ipSegments[0]],
        octet1: [ipSegments[1]],
        octet2: [ipSegments[2]],
        octet3: [{min: ipSegments[3], max: ipSegments[3] + ipScanRangeSize}], //range of 7 to 10 inclusive
      });
      console.log(`ipSegments:`, ipSegments);
      return new Promise((resolve, reject) => {
        scanner.scan(scannerOptions, function callback(results) {
          resolve(results);
          /*
            results will contain response
            {
              uri : string,
              code : httpResponseCode ie. [200],
              body : httpResponseBody
            }

          */
        });

      }).then(engineList => {
        return engineList.map(engine => {
          return {ip: engine.ip, port: engine.port, name: engine.body}
        });
      });
    })
}

class RulesServer extends SocketServerCore {

  constructor() {
    const _socketServer = instantiateSocketServer();
    super(_socketServer);
    this.getSocketServer = function() { return _socketServer };
    this.namespaceIdentifier = rulesNamespaceIdentifier; // used by SocketServerCore
  }

  addSocketEvents(socket) {
    const dns = require('dns');
    socket.on('rulesEngineListRequest', (fn) => {
      const os = require('os');
      console.log(`hostname:`, os.hostname());
      getEngineList()
        .then(rulesEnginesList => {
          fn({engines: rulesEnginesList });
        });
    })
  }

  getAvailableRulesEngines() {
    return getEngineList()
      .then(rulesEnginesList => {
        console.log(`rulesEnginesList`, rulesEnginesList);
        return {engines: rulesEnginesList };
      });
  }
}

module.exports = RulesServer;
