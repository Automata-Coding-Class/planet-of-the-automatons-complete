import * as StateConnection from '../connections/state-connection';

const stateConnection = StateConnection.createStateConnection();

export default {
  namespaced: true,
  state: {
    newGameRows: 12,
    newGameColumns: 12,
    boardGrid: {
      rows: 5,
      columns: 5
    },
    layout: {}
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
    gameDataUpdated: function(state, gameData) {
      console.log(`will update the game data state:`, gameData);
      state.boardGrid.rows = parseInt(gameData.parameters.boardGrid.rows);
      state.boardGrid.columns = parseInt(gameData.parameters.boardGrid.columns);
      state.layout = gameData.layout;
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
        commit('setBoardDimensions', newGameResponse.parameters.boardGrid);
        commit('setLayout', newGameResponse.layout);
      });
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
    requestNewGame({}, options) {
      stateConnection.requestNewGame(options);
    },
    refreshGameData({commit}) {
      stateConnection.getGameData()
        .then((gameData) => {
          commit('gameDataUpdated', gameData);
        });
    }
  }
}
