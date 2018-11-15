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
  },
  actions: {
    connect({commit, dispatch, state}, authToken) {
      stateConnection.createConnection(authToken)
        .then(() => {
          console.log(`connected to the stateMachine server`);
          return stateConnection.getGameParameters();
        })
        .then(gameParameters => {
          console.log(`StateMachineModule - gameParameters:`, gameParameters);
          commit('setBoardDimensions', gameParameters.boardGrid);
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
      console.log(`one`);
      stateConnection.requestNewGame(options);
    }
  }
}
