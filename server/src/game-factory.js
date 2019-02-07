const EventEmitter = require('events');
const NetScan = require('netscan');
const scanner = new NetScan();
const network = require('network');
const uuid = require('uuid/v1');
const logger = require('./logger');

const GameProxy = require('./sockets/clients/game-proxy');

const rulesNamespaceIdentifier = 'rules';
const ipScanRangeSize = process.env.IP_SCAN_RANGE_SIZE !== undefined ? process.env.IP_SCAN_RANGE_SIZE : 100;
const ipPattern = /^(\d+)\.(\d+)\.(\d+)\.(\d+)/;

function getRulesEnginePorts() {
  logger.info(`RULES_ENGINE_PORTS: ${process.env.RULES_ENGINE_PORTS}`);
  const rawPortValue = process.env.RULES_ENGINE_PORTS || '5000';
  return rawPortValue.split(/\s*,\s*/).map(str => {
    const port = parseInt(str, 10);
    if (isNaN(port)) { // named pipe
      return str;
    }
    if (port >= 0) { // port number
      return port;
    }
  });
}

function getStartingIpAddress() {
  // first figure out the current machine's IP address, and gateway if possible
  return new Promise((resolve, reject) => {
    network.get_active_interface((err, netInterface) => {
      if (err) {
        throw err;
      } else {
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

function getLocalIp() {
  return new Promise((resolve, reject) => {
    network.get_active_interface((err, netInterface) => {
      if (err) {
        throw err;
      } else {
        resolve(netInterface.ip_address);
      }
    })
  });
}

function getEngineList() {
  console.log(`inside getEngineList`);
  return getStartingIpAddress()
    .then(startingIp => {

      const rulesEnginePorts = getRulesEnginePorts();
      logger.info(`GameFactory - will scan port range %o`, rulesEnginePorts);
      const scannerOptions = {
        protocol : ['http'],
        ports: rulesEnginePorts, //[80, 90, 443, 1337],
        codes: [200, 201, 202], //only count it if a 200 comes back,
        errors : [], //like 'ETIMEDOUT'
        paths: '/api/helloworld' || [string], // optional to have it hit a specific endpoint
        headers: {}, // include the following headers in all request so you can do auth or something,
        timeout: 500, //10000, //10 seconds timeout)
        ignoreResponse : false //tells it to not return the body as part of the results


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
          resolve(results.reduce((list, entry) => {
            for(let i=0; i < list.length; i++) {
              if(list[i].ip === entry.ip && list[i].port === entry.port) {
                return list;
              }
            }
            list.push(entry);
            return list;
          }, []));
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
        return getLocalIp()
          .then(localIp => {
            return {localIp: localIp, engines: engineList};
          })

      })
        .then(networkAddressData => {
          return networkAddressData.engines.map(engine => {
            console.log(`ENGINE BODY:`, engine.body);
            const body = typeof engine.body === 'object' ? engine.body : JSON.parse(engine.body);
            return {ip: engine.ip, port: engine.port, name: body.name, isLocal: engine.ip === networkAddressData.localIp}
          });
        });
    })
}

class GameFactory extends EventEmitter {

  constructor() {
    super();
    this.namespaceIdentifier = rulesNamespaceIdentifier; // used by SocketServerCore
    this.activeGames = new Map();
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

  static createNewGame(options) {
    // this is a little weird, I know, but game-engine needs this function to
    // return a Promise, and constructors can't be asynchronous (or return a
    // Promise instead of the instantiated class)
    const gameProxy = new GameProxy(options);
    return gameProxy.connect()
      .then(proxy => {
        return proxy;
      })
  }
}

module.exports = GameFactory;
