const createCoreSocketConnection = require('../src/socket-connections/core-socket-connection');

const SocketClient = require('socket.io-client');
describe('CoreSocketConnection', () => {
  jest.mock('socket.io-client');

  const fakeServerAddress = 'http://fakehost.local';
  let socketConnection;

  beforeEach(() => {
    socketConnection = createCoreSocketConnection(fakeServerAddress);
  })

  afterEach(() => {
    socketConnection = undefined;
  })
  describe('constructor', () => {
    test('constructor returns object with required properties', () => {
      expect(socketConnection).toHaveProperty('objectName', 'CoreSocketConnection');
      const functionNameList = [
        'createConnection',
        'disconnect',
        'ping',
        'addEventListener',
        'on',
        'dispatchEvent',
      ];
      expect(Object.keys(socketConnection)).toEqual(expect.arrayContaining(functionNameList));
      expect(functionNameList.every(name => socketConnection[name] instanceof Function)).toBeTruthy();
    })
  })

  describe('functions', () => {
    describe('local event handlers', () => {
      test('accepts event listeners and calls them when the corresponding event is dispatched', () => {
        const handler1 = jest.fn(), handler2 = jest.fn();
        socketConnection.addEventListener('test', handler1);
        socketConnection.addEventListener('test', handler2);
        const fakeArgs = [{foo: 'bar'}, 'quux', 42];
        socketConnection.dispatchEvent('test', ...fakeArgs);
        expect(handler1).toHaveBeenCalledWith(...fakeArgs);
        expect(handler2).toHaveBeenCalledWith(...fakeArgs);
        socketConnection.removeEventListener('test', handler1);
        socketConnection.dispatchEvent('test', ...fakeArgs);
        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(2);
      })
    })
  })
})
