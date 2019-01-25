import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import AuthenticationModule from './authentication-module';
import StateMachineModule from './state-machine-module';
import GameEventModule from './game-event-module';
import RulesModule from './rules-module';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    authentication: AuthenticationModule,
    stateMachine: StateMachineModule,
    gameEvents: GameEventModule,
    rules: RulesModule
  },
  plugins: [createPersistedState()]
});
