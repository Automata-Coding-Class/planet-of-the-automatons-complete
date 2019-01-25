import * as RulesConnection from '../connections/rules-connection';

const rulesConnection = RulesConnection.createRulesConnection();

export default {
  namespaced: true,
  state: {
    availableRulesEngines: []
  },
  getters: {},
  mutations: {
    rulesEngineListReceived(state, rulesEngineList) {
      console.log(`updating Rules Engine list:`, rulesEngineList);
      state.availableRulesEngines = rulesEngineList;
    }
  },
  actions: {
    connect({commit, dispatch, state}, authToken) {
      rulesConnection.createConnection(authToken)
        .then(() => {
          console.log(`connected to the rules server`);
          dispatch('refreshRulesEngineList');
        });
    },
    refreshRulesEngineList({commit}) {
      rulesConnection.getAvailableRulesEngines()
        .then(rulesEngineList => {
          commit('rulesEngineListReceived', rulesEngineList)
        })
    }
  }
}
