const GameStateServer = require('./state-server');
const http = require('http');
const SocketIO = require('socket.io'); // ioBack
const SocketIoClient = require('socket.io-client');

const stateNamespace = '/state';

let httpServer;
let httpServerAddress;
let ioServer;
let socket;
let gameStateServer, gameStateClient;

beforeAll(() => {
  httpServer = http.createServer();
  httpServerAddress = httpServer.listen().address();
  ioServer = SocketIO(httpServer);
});

afterAll(() => {
  if (ioServer !== undefined) {
    ioServer.close();
  }
  if(httpServer !== undefined) {
    httpServer.close();
  }
});

beforeEach(() => {
  gameStateServer = new GameStateServer(ioServer);
  gameStateServer.connect();
  socket = SocketIoClient.connect(`http://[${httpServerAddress.address}:${httpServerAddress.port}`, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket']
  });
});

afterEach(() => {
  gameStateServer.disconnect();
  gameStateServer = undefined;
});

describe('GameStateServer', () => {
  describe('setup and teardown', () => {
    test('namespace has been created', () => {
      expect(Object.keys(ioServer.nsps)).toEqual(expect.arrayContaining(['/state']));
    })
    test('namespace has been removed', () => {
      gameStateServer.disconnect();
      expect(Object.keys(ioServer.nsps)).toEqual(expect.not.arrayContaining(['/state']));
    })
    test('emits events', () => {
      const pingHandler = jest.fn();
      gameStateServer.on('pingResponse', pingHandler);
      gameStateServer.localPing();
      expect(pingHandler).toHaveBeenCalled();
    })
  })
  describe('client connection', () => {
    test('fuck this', async () => {
      const handleConnection = jest.fn();
      // const handleConnection = function(msg) {
      //   expect(msg).toBe('this is so fucked!');
      // };
      const socketOptions = { transports: ['websocket'], 'force new connection': true};
      gameStateServer.on('clientConnected', handleConnection);
      const mySocket = await SocketIoClient(`http://[${httpServerAddress.address}]:${httpServerAddress.port}${stateNamespace}`, socketOptions);
      const mySocket2 = await SocketIoClient(`http://[${httpServerAddress.address}]:${httpServerAddress.port}${stateNamespace}`, socketOptions);
      mySocket2.on('message', function(msg) {
        expect(msg).toBe('ha ha fuck you');
      })
      mySocket.emit('message', 'tonight\s the bithc!');
          // expect(handleConnection).toHaveBeenCalled();
    })
    // test('client can connect; connection event emitted', () => {
    //   jest.useFakeTimers();
    //   const handleConnection = jest.fn();
    //   gameStateServer.on('clientConnected', handleConnection);
    //   const client = SocketIoClient.connect(`http://[${httpServerAddress.address}]:${httpServerAddress.port}${stateNamespace}`);
    //   setTimeout(() => {
    //     expect(handleConnection).toHaveBeenCalled();
    //   }, 50);
    //   jest.runAllTimers();
    // })
  })
});
