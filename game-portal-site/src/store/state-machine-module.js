import * as StateConnection from '../connections/state-connection';

const stateConnection = StateConnection.createStateConnection();

console.log(`stateConnection:`, stateConnection);

export default {
  namespaced: true,
  state: {
    boardGrid: {
      rows: 5,
      columns: 5
    }
  },
  getters: {},
  mutations: {
    setBoardDimensions: function (state, grid) {
      console.log(`setBoardDimensions:`, grid);
      state.boardGrid.rows = parseInt(grid.rows);
      state.boardGrid.columns = parseInt(grid.columns);
    }
  },
  actions: {
    connect({commit, dispatch, state}, authToken) {
      console.log(`gonna try to connect a user to the state machine:`, authToken);
      stateConnection.createConnection(authToken)
        .then(() => {
          return stateConnection.getGameParameters();
        })
        .then(gameParameters => {
          console.log(`StateMachineModule - gameParameters:`, gameParameters);
          commit('setBoardDimensions', gameParameters.boardGrid);
        });
      stateConnection.on('newGameCreated', function gameParameterHandler(gameParameters) {
        console.log(`seven`, gameParameters);
        commit('setBoardDimensions', gameParameters.boardGrid);
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
