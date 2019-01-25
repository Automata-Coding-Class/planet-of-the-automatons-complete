const SocketServerCore = require('./socket-server-core');
const NetScan = require('netscan');
const scanner = new NetScan();
const network = require('network');

const rulesNamespaceIdentifier = 'rules';
const ipScanRangeSize = process.env.IP_SCAN_RANGE_SIZE !== undefined ? process.env.IP_SCAN_RANGE_SIZE : 100;
const ipPattern = /^(\d+)\.(\d+)\.(\d+)\.(\d+)/;

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

      });
    })
}

class RulesServer extends SocketServerCore {
  constructor(socketServer) {
    super(socketServer);
    this.namespaceIdentifier = rulesNamespaceIdentifier; // used by SocketServerCore
  }

  addSocketEvents(socket) {
    const dns = require('dns');
    socket.on('rulesEngineListRequest', (fn) => {
      const os = require('os');
      console.log(`hostname:`, os.hostname());
      getEngineList()
        .then(rulesEnginesList => {
          rulesEnginesList = rulesEnginesList.map(engine => {
            return {ip: engine.ip, name: engine.body}
          });
          console.log(`rulesEnginesList`, rulesEnginesList);
          fn({engines: rulesEnginesList });
        });
    })
  }
}

module.exports = RulesServer;
