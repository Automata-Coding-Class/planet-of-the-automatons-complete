import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import AuthenticationModule from './authentication-module';
import StateMachineModule from './state-machine-module';
import GameEventModule from './game-event-module';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    authentication: AuthenticationModule,
    stateMachine: StateMachineModule,
    gameEvents: GameEventModule
  },
  plugins: [createPersistedState()]
});
