<template>
  <div class="home">
      <div class="content main">
          <h1>Automaton Planet</h1>
          <p>[ description of the app + ecosystem here ]</p>
          <Login v-if="showLogin"></Login>
          <p><button @click="testAuthToken()">test</button></p>
      </div>
  </div>
</template>

<script>
// @ is an alias to /src
import axios from 'axios';
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
  },
  methods: {
    testAuthToken() {
      const requestOptions = {};
      const token = this.$store.state.authentication.authToken;
      console.log(`token`, token);
      if (token !== undefined) {
        requestOptions.headers = {Authorization: `Bearer ${token}`};
      }
      console.log(`requestOptions`, requestOptions);
      axios.get(`${process.env.VUE_APP_API_URL}/secure/test`, requestOptions)
        .then(response => {
          console.log(`response`, response);
        }, err => {
          console.error(`error`, err);

        })
        .catch(err => {
          console.error(`error`, err);
        })

    }

  }
};
</script>
