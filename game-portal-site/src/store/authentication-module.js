import {authenticateUser} from '../connections/authentication-connection';

export default {
  namespaced: true,
  state: {
    authToken: undefined,
    loginType: undefined,
    username: undefined,
    loginError: undefined,
    userRoles: []
  },
  getters: {
    isLoggedIn: state => {
      return state.authToken !== undefined;
    }
  },
  mutations: {
    receiveLoginData(state, loginData) {
      console.log('receiveLoginData', loginData);
      state.loginType = loginData.loginType;
      state.username = loginData.username;
      state.authToken = loginData.token;
      state.userRoles = loginData.roles;
    },
    handleLoginError(state, error) {
      state.loginError = error;
    },
    signOut(state) {
      state.loginType = undefined;
      state.username = undefined;
      state.authToken = undefined;
      state.userRoles = [];
    }
  },
  actions: {
    authenticate({commit}, data) {
      console.log(`authentication-module.authenticate called`, data);
      return authenticateUser(data.loginType, data.username, data.password)
        .then(loginData => {
            commit('receiveLoginData', loginData);
          },
          err => {
            console.log(`err:`, err);
            commit('handleLoginError', err);
          });
    },
    signOut({commit}) {
      commit('signOut');
    }
  }
}
