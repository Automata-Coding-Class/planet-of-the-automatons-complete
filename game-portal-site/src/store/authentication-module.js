import {authenticateUser} from '../connections/authentication-connection';

export default {
  namespaced: true,
  state: {
    authToken: undefined,
    authenticatedUser: {
      loginType: undefined,
      username: undefined,
      userRoles: []
    },
    loginError: undefined,
  },
  getters: {
    isLoggedIn: state => {
      return state.authToken !== undefined;
    },
    userIsAdmin: state => {
      return state.authenticatedUser !== undefined
      && state.authenticatedUser.userRoles !== undefined
      && state.authenticatedUser.userRoles.includes('admin');
    }
  },
  mutations: {
    receiveLoginData(state, loginData) {
      console.log('receiveLoginData', loginData);
      state.authToken = loginData.token;
      state.authenticatedUser = {};
      state.authenticatedUser.loginType = loginData.loginType;
      state.authenticatedUser.username = loginData.username;
      state.authenticatedUser.userRoles = loginData.roles;
    },
    handleLoginError(state, error) {
      state.loginError = error;
    },
    signOut(state) {
      state.authToken = undefined;
      state.authenticatedUser = undefined;
      // state.authenticatedUser.loginType = undefined;
      // state.authenticatedUser.username = undefined;
      // state.authenticatedUser.userRoles = [];
    }
  },
  actions: {
    authenticate({commit, dispatch, state}, data) {
      console.log(`authentication-module.authenticate called`, data);
      return authenticateUser(data.loginType, data.username, data.password)
        .then(loginData => {
            commit('receiveLoginData', loginData);
            dispatch('stateMachine/connect',loginData.token, {root: true});
          },
          err => {
            console.log(`err:`, err);
            commit('handleLoginError', err);
          });
    },
    signOut({commit, dispatch}) {
      commit('signOut');
      dispatch('stateMachine/disconnect', {}, {root:true});
    }
  }
}
