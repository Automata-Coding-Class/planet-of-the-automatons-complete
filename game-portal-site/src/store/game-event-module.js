import * as GameEventConnection from '../connections/event-connection';

const gameEventConnection = GameEventConnection.createEventConnection();

export default {
  namespaced: true,
  state: {
    playerList: [],
    maxLogLength: 500,
    eventLog: []
  },
  getters: {},
  mutations: {
    gameEventOccurred(state, evt) {
      state.eventLog.unshift(evt);
      if (state.eventLog.length > state.maxLogLength) {
        state.eventLog.pop();
      }
    },
    playerListReceived(state, playerList) {
      state.playerList = playerList;
    }
  },
  actions: {
    connect({commit, dispatch, state}, authToken) {
      gameEventConnection.on('notify', (evt) => {
        commit('gameEventOccurred', evt);
      });
      gameEventConnection.on('playerJoined', (player) => {
        dispatch('refreshPlayerList');
      });
      gameEventConnection.on('playerLeft', (player) => {
        dispatch('refreshPlayerList');
      });
      gameEventConnection.createConnection(authToken)
        .then(() => {
          console.log(`connected to the gameEvents server`);
          dispatch('refreshPlayerList');
          //   // return gameEventConnection.getGameParameters();
        });
      // .then(gameParameters => {
      //   console.log(`StateMachineModule - gameParameters:`, gameParameters);
      //   commit('setBoardDimensions', gameParameters.boardGrid);
      // });
      // stateConnection.on('newGameCreated', function gameParameterHandler(gameParameters) {
      //   console.log(`seven`, gameParameters);
      //   commit('setBoardDimensions', gameParameters.boardGrid);
      // });
    },
    refreshPlayerList({commit}) {
      gameEventConnection.getPlayerList()
        .then(playerList => {
          commit('playerListReceived', playerList)
        })
    }
  }
}
