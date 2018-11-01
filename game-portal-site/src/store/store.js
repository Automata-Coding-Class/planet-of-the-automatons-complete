import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import AuthenticationModule from './authentication-module';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    authentication: AuthenticationModule
  },
  plugins: [createPersistedState()]
});
