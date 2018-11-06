<template>
    <div class="login-status">
        <div v-if="loggedIn">
            <span title="logged in as…"><font-awesome-icon icon="user"/></span>
            {{username}}
            <span class="sign-out" title="sign out" @click="signOut"><font-awesome-icon
                    icon="sign-out-alt"/></span>
        </div>
        <div class="login-button-widget" v-if="showLoginWidget">
            <button @click="goToLogin">Log In</button>
        </div>
    </div>
</template>

<script>
  import {validateAndRoute} from "../../router";

  export default {
    name: "LoginStatus",
    props: {
      excludedRoutes: {
        type: Array,
        default: []
      }
    },
    computed: {
      loggedIn: function () {
        return this.$store.state.authentication.authToken !== undefined
          && this.$store.state.authentication.authenticatedUser.loginType !== undefined
          && this.$store.state.authentication.authenticatedUser.username !== undefined;
      },
      username: function () {
        return this.$store.state.authentication.authenticatedUser.username;
      },
      showLoginWidget: function () {
        return !this.loggedIn && !this.excludedRoutes.includes(this.$router.history.current.name);
      },
      currentUserRoles: function() {
        return this.$store.state.authentication.authenticatedUser !== undefined ?
          this.$store.state.authentication.authenticatedUser.userRoles :
          [];
      }
    },
    methods: {
      goToLogin() {
        this.$router.push({name: 'login'});
      },
      signOut() {
        this.$store.dispatch('authentication/signOut')
          .then(result => {
            const redirectRoute = validateAndRoute(this.$router.history.current,
              this.$store.state.authentication.authToken !== undefined,
              this.currentUserRoles);
            console.log(`redirect route = `, redirectRoute);
            if (redirectRoute !== undefined) this.$router.push(redirectRoute);
          });
      }
    }
  }
</script>

<style scoped>

</style>
