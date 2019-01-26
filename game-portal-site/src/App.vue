<template>
  <div id="app">
      <div id="banner">
          <MainNav></MainNav>
          <LoginStatus :excludedRoutes="['home', 'login']"></LoginStatus>
      </div>
    <router-view class="main-view"/>
  </div>
</template>

<script>
  import MainNav from './components/shared/MainNav';
  import LoginStatus from './components/shared/LoginStatus';

  export default {
    components: {LoginStatus, MainNav},
    mounted() {
      if(this.$store.state.authentication.authToken !== undefined) {
        this.$store.dispatch('stateMachine/connect', this.$store.state.authentication.authToken);
        this.$store.dispatch('gameEvents/connect', this.$store.state.authentication.authToken);
      }
    }
  }


</script>

<style lang="scss">

</style>
