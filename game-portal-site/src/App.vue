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
    components: {LoginStatus, MainNav}
  }


</script>

<style lang="scss">

</style>
