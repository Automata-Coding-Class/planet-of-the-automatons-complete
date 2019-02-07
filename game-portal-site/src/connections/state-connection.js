import * as CoreSocketConnection from './core-socket-connection'


export function createStateConnection() {
  const namespaceIdentifier = 'state';
  const coreConnection = CoreSocketConnection.createCoreSocketConnection();

  let socket;

  const createConnection = async authToken => {
    socket = await coreConnection.createConnection(namespaceIdentifier, authToken);
    addSocketEvents(socket);
  };

  const addSocketEvents = socket => {
    socket.on('availableRulesEnginesUpdated', response => {
      coreConnection.dispatchEvent('availableRulesEnginesUpdated', response.engines);
    });
    socket.on('newGameCreated', gameParameters => {
      coreConnection.dispatchEvent('newGameCreated', gameParameters);
    });
    socket.on('gameStateUpdated', updatedGameState => {
      coreConnection.dispatchEvent('gameStateUpdated', updatedGameState);
    });
  };

  const requestAvailableRulesEngines = () => {
    return new Promise(resolve => {
      console.log(`inside the get rules engines promise`);
      socket.emit('rulesEngineListRequest', function (response) {
        resolve(response.engines);
      });
    });
  };

  const getGameParameters = () => {
    return new Promise(resolve => {
      socket.emit('gameParamsRequest', function (gameParameters) {
        console.log(`gameParameters response:`, gameParameters);
        resolve(gameParameters);
      });
    });
  };

  const getGameData = () => {
    return new Promise(resolve => {
      console.log(`socket:`, socket);
      return socket.emit('gameDataRequest', function (gameData) {
        console.log(`gameData response:`, gameData);
        resolve(gameData);
      });
    });
  };

  const requestNewGame = options => {
    return socket.emit('newGameRequest', options);
  };

  const startGame = gameId => {
    return socket.emit('startGame', {gameId: gameId});
  };

  const pauseGame = gameId => {
    return socket.emit('pauseGame', {gameId: gameId});
  };

  const resumeGame = gameId => {
    return socket.emit('resumeGame', {gameId: gameId});
  };

  const stopGame = gameId => {
    console.log(`WILL STOP GAME!`);
    return socket.emit('stopGame', {gameId: gameId});
  };

  const testRulesEngine = gameId => {
    console.log(`StateConnection - testRulesEngine. gameId=${gameId}`);
    const fireAndForget = true;
    if(fireAndForget) {
      // template for 'fire and forget' calls
      socket.emit('startGame', {gameId: gameId});
    } else {
      // template for calls that expect a response
      socket.emit('gameDataRequest', gameId, response => {
        console.log(`game data response:`, response);
      });
    }
  };

  return {
    objectName: 'StateMachineConnection',
    createConnection: createConnection,
    disconnect: coreConnection.disconnect,
    ping: coreConnection.ping,
    testRulesEngine: testRulesEngine,
    requestAvailableRulesEngines: requestAvailableRulesEngines,
    getGameParameters: getGameParameters,
    requestNewGame: requestNewGame,
    startGame: startGame,
    pauseGame: pauseGame,
    resumeGame: resumeGame,
    stopGame: stopGame,
    getGameData: getGameData,
    on: coreConnection.on
  };
}

