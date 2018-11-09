import * as GameEventConnection from '../connections/event-connection';

const gameEventConnection = GameEventConnection.createEventConnection();

export default {
  namespaced: true,
  state: {
    maxLogLength: 500,
    eventLog: []
  },
  getters: {
  },
  mutations: {
    gameEventOccurred(state, evt) {
      state.eventLog.unshift(evt);
      if(state.eventLog.length > state.maxLogLength) {
        state.eventLog.pop();
      }
      console.log(`eventLog`, state.eventLog);
    }
  },
  actions: {
    connect({commit, dispatch, state}, authToken) {
      gameEventConnection.on('notify', (evt) => {
        commit('gameEventOccurred', evt);
      }),
      gameEventConnection.createConnection(authToken)
        .then(() => {
          console.log(`connected to the gameEvents server`);
        //   // return gameEventConnection.getGameParameters();
        })
        // .then(gameParameters => {
        //   console.log(`StateMachineModule - gameParameters:`, gameParameters);
        //   commit('setBoardDimensions', gameParameters.boardGrid);
        // });
      // stateConnection.on('newGameCreated', function gameParameterHandler(gameParameters) {
      //   console.log(`seven`, gameParameters);
      //   commit('setBoardDimensions', gameParameters.boardGrid);
      // });
    },
  }
}
