import * as StateConnection from '../connections/state-connection';

const stateConnection = StateConnection.createStateConnection();

// this shuffle function is a modified version of a function from:
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// but returning a new array instead of modifying the existing one in place
// the accepted answer on the StackOverflow page also works, but this implementation
// is more compact
function shuffleArray(array) {
  const shuffledArray = [].concat(array);
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

export default {
  namespaced: true,
  state: {
    availableRulesEngines: [],
    selectedRulesEngine: undefined,
    gameId: undefined,
    gameStatus: 'unknown',
    gameTime: {
      limit: 0,
      elapsed: 0,
    },
    elapsedGameTime: 0,
    newGameRows: 12,
    newGameColumns: 12,
    newGameDuration: 30,
    boardGrid: {
      rows: 5,
      columns: 5,
      totalAssets: 0
    },
    stylingOptions: {
      iconNames: ['cat', 'dog', 'crow', 'fish', 'dove', 'frog',
        'hippo', 'horse', 'kiwi-bird', 'otter', 'spider'],
      colors: ['#ff7400', '#d9005b', '#84e900', '#009999', '#ec6aa1', '#a64b00', '#8d003b']
    },
    layout: {},
    playerAttributes: {},
    playerData: {}
  },
  getters: {
    players(state) {
      return Object.entries(state.playerData).reduce((playerList, entry) => {
        const player = {id: entry[0], username: entry[1].rawData.username, score: entry[1].score};
        if (state.playerAttributes.hasOwnProperty(player.id)) {
          Object.assign(player, state.playerAttributes[player.id]);
        }
        playerList.push(player);
        return playerList;
      }, []);
    }
  },
  mutations: {
    newGameRowsChanged: function (state, newValue) {
      state.newGameRows = newValue;
    },
    newGameColumnsChanged: function (state, newValue) {
      state.newGameColumns = newValue;
    },
    newGameDurationChanged: function (state, newValue) {
      state.newGameDuration = newValue;
    },
    setBoardDimensions: function (state, grid) {
      console.log(`setBoardDimensions:`, grid);
      state.boardGrid.rows = parseInt(grid.rows);
      state.boardGrid.columns = parseInt(grid.columns);
    },
    setLayout: function (state, layout) {
      state.layout = layout;
    },
    setGameStatus: function (state, status) {
      state.gameStatus = status;
    },
    rulesEngineListReceived(state, rulesEngineList) {
      console.log(`updating Rules Engine list:`, rulesEngineList);
      state.availableRulesEngines = rulesEngineList;
      if (state.selectedRulesEngine === undefined && state.availableRulesEngines !== undefined) {
        for (let i = 0; i < state.availableRulesEngines.length; i++) {
          if (state.availableRulesEngines[i].isLocal) {
            state.selectedRulesEngine = state.availableRulesEngines[i];
            break;
          }
        }
      }
    },
    rulesEngineSelected(state, engineAddress) {
      const match = /^([\d.]+):(\d+)$/.exec(engineAddress);
      if (match) {
        const ip = match[1], port = match[2];
        for (let i = 0; i < state.availableRulesEngines.length; i++) {
          const engine = state.availableRulesEngines[i];
          if(ip === engine.ip.toString() && port === engine.port.toString()) {
            state.selectedRulesEngine = engine;
            break;
          }
        }
      }
    },
    gameDataUpdated: function (state, gameData) {
      console.log(`will update the game data state:`, gameData);
      if (!gameData) {
        console.log(`no game data`);
        state.gameId = undefined;
        state.gameStatus = 'unknown';
        state.layout = [];
        state.playerData = {};
        state.elapsedGameTime = 0;
        state.gameTime.limit = 0;
        state.gameTime.elapsed = 0;
        state.boardGrid.totalAssets = 0;
      } else {
        state.gameId = gameData.id;
        state.gameStatus = gameData.status;
        state.boardGrid.rows = parseInt(gameData.parameters.boardGrid.rows);
        state.boardGrid.columns = parseInt(gameData.parameters.boardGrid.columns);
        state.layout = gameData.layout;
        state.playerData = gameData.playerData;
        state.gameTime.limit = gameData.parameters.duration;
        state.gameTime.elapsed = Math.min(gameData.elapsedTime, gameData.parameters.duration);
        state.boardGrid.totalAssets = gameData.totalAssets;
      }
    },
    newPlayerAttributesReceived: function (state, playerAttributes) {
      state.playerAttributes = playerAttributes;
    },
    clearGameState: function (state) {
      state.playerAttributes = {};
    }
  },
  actions: {
    connect({commit, dispatch, state}, authToken) {
      stateConnection.createConnection(authToken)
        .then(() => {
          dispatch('refreshRulesEngineList');
        })
        .then(() => {
          console.log(`connected to the stateMachine server`);
          return stateConnection.getGameData();
        })
        .then(gameData => {
          console.log(`StateMachineModule - gameData:`, gameData);
          commit('gameDataUpdated', gameData);
        });
      stateConnection.on('availableRulesEnginesUpdated', function rulesEnginesListHandler(engines) {
        commit('rulesEngineListReceived', engines);
      });
      stateConnection.on('newGameCreated', function newGameHandler(newGameResponse) {
        console.log(`new game response`, newGameResponse);
        commit('gameDataUpdated', newGameResponse);
        // commit('setBoardDimensions', newGameResponse.parameters.boardGrid);
        // commit('setLayout', newGameResponse.layout);
      });
      stateConnection.on('gameStateUpdated', function gameStateUpdateHandler(updatedGameState) {
        console.log(`updated game state received!`, updatedGameState);
        commit('gameDataUpdated', updatedGameState);
      })
    },
    disconnect() {
      stateConnection.disconnect();
    },
    refreshRulesEngineList({}) {
      stateConnection.requestAvailableRulesEngines();
    },
    testRulesEngine({state}) { // a dev utility that can be switch up to 'ping' different things on the back end
      console.log(`got as far as the state module`);
      stateConnection.testRulesEngine(state.gameId);
    },
    getGameParameters() {
      stateConnection.getGameParameters();
    },
    ping() {
      stateConnection.ping()
        .then(response => {
          console.log(`StateMachineModule - ping response:`, response);
        })
    },
    requestNewGame({commit}, options) {
      commit('clearGameState');
      stateConnection.requestNewGame(options);
    },
    refreshGameData({commit}) {
      stateConnection.getGameData()
        .then((gameData) => {
          commit('gameDataUpdated', gameData);
        });
    },
    startGame({dispatch}, playerList) {
      console.log(`StateMachine.startGame - playerList`, playerList);
      dispatch('setPlayerAttributes', playerList);
      stateConnection.startGame();
    },
    pauseGame({dispatch}, playerList) {
      console.log(`StateMachine.pauseGame`);
      stateConnection.pauseGame();
    },
    resumeGame({dispatch}, playerList) {
      console.log(`StateMachine.resumeGame`);
      stateConnection.resumeGame();
    },
    setPlayerAttributes({commit, state}, playerList) {
      console.log(`available icons:`, state.stylingOptions.iconNames);
      const shuffledIcons = shuffleArray(state.stylingOptions.iconNames);
      console.log(`shuffledIcons:`, shuffledIcons);
      const playerAttributes = {};
      playerList.forEach((p, i) => {
        playerAttributes[p.userId] = {
          iconName: shuffledIcons[i],
          color: state.stylingOptions.colors[i]
        };
      });
      commit('newPlayerAttributesReceived', playerAttributes);
    },
    stopGame({commit}, playerList) {
      stateConnection.stopGame();
      // commit('newPlayerAttributesReceived', {});
    }
  }
}
