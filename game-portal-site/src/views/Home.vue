<template>
  <div class="home">
      <div class="content main">
          <h1>Automaton Planet</h1>
          <p>[ description of the app + ecosystem here ]</p>
          <Login v-if="showLogin"></Login>
      </div>
  </div>
</template>

<script>
// @ is an alias to /src
import {mapGetters} from 'vuex';
import Login from '@/components/shared/Login.vue';

export default {
  name: 'home',
  components: {
    Login
  },
  computed: {
    ...mapGetters('authentication', ['isLoggedIn']),
    showLogin: function () {
      return !this.isLoggedIn;
    },
  }
};
</script>
