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
    gameStatus: 'unknown',
    newGameRows: 12,
    newGameColumns: 12,
    boardGrid: {
      rows: 5,
      columns: 5
    },
    stylingOptions: {
      iconNames: ['cat', 'dog', 'crow', 'fish', 'dove', 'frog',
        'hippo', 'horse', 'kiwi-bird', 'otter', 'spider'],
      colors: ['red', 'orange', 'green', 'blue', 'indigo', 'violet', 'rebeccapurple']
    },
    layout: {},
    playerAttributes: {}
  },
  getters: {},
  mutations: {
    newGameRowsChanged: function(state, newValue) {
      state.newGameRows = newValue;
    },
    newGameColumnsChanged: function(state, newValue) {
      state.newGameColumns = newValue;
    },
    setBoardDimensions: function (state, grid) {
      console.log(`setBoardDimensions:`, grid);
      state.boardGrid.rows = parseInt(grid.rows);
      state.boardGrid.columns = parseInt(grid.columns);
    },
    setLayout: function(state, layout) {
      state.layout = layout;
    },
    setGameStatus: function(state, status) {
      state.gameStatus = status;
    },
    gameDataUpdated: function(state, gameData) {
      console.log(`will update the game data state:`, gameData);
      state.gameStatus = gameData.status;
      state.boardGrid.rows = parseInt(gameData.parameters.boardGrid.rows);
      state.boardGrid.columns = parseInt(gameData.parameters.boardGrid.columns);
      state.layout = gameData.layout;
    },
    newPlayerAttributesReceived: function(state, playerAttributes) {
      state.playerAttributes = playerAttributes;
    },
    clearGameState: function(state) {
      state.playerAttributes = {};
    }
  },
  actions: {
    connect({commit, dispatch, state}, authToken) {
      stateConnection.createConnection(authToken)
        .then(() => {
          console.log(`connected to the stateMachine server`);
          return stateConnection.getGameData();
        })
        .then(gameData => {
          console.log(`StateMachineModule - gameData:`, gameData);
          commit('gameDataUpdated', gameData);
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
    setPlayerAttributes({commit, state}, playerList) {
      console.log(`available icons:`, state.stylingOptions.iconNames);
      const shuffledIcons = shuffleArray(state.stylingOptions.iconNames);
      console.log(`shuffledIcons:`, shuffledIcons);
      const playerAttributes = {};
      playerList.forEach((p,i) => {
        playerAttributes[p.userId] = {iconName: shuffledIcons[i], color: state.stylingOptions.colors[i]};
      })
      commit('newPlayerAttributesReceived', playerAttributes);
    },
    stopGame({commit}, playerList) {
      stateConnection.stopGame();
      // commit('newPlayerAttributesReceived', {});
    }
  }
}
