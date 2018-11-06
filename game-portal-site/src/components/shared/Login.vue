<template>
    <div class="component login">
        <b-form class="login-form" @submit="onSubmit" v-if="show">
            <b-form-group id="exampleInputGroup2"
                          label="First, we need to know who you are:"
                          label-for="exampleInput2">
                <b-form-group>
                    <b-form-radio-group id="loginTypeRadioButtons" v-model="loginType"
                                        :options="loginTypeOptions" name="loginType">
                    </b-form-radio-group>
                </b-form-group>
                <b-form-input id="name"
                              type="text"
                              v-model="name"
                              required
                              placeholder="Enter user name">
                </b-form-input>
                <b-form-input id="password"
                              type="password"
                              v-model="password"
                              v-if="showPassword"
                              required
                              placeholder="Enter password">
                </b-form-input>
            </b-form-group>
            <b-button type="submit" variant="primary">Log In</b-button>
        </b-form>
        <p class="error" v-if="errorMessage">Login failed: {{errorMessage}}</p>
    </div>
</template>

<script>
  // https://scotch.io/tutorials/vue-authentication-and-route-handling-using-vue-router

  import axios from 'axios';

  export default {
    name: "Login",
    data() {
      return {
        show: true,
        loginType: 'guest',
        loginTypeOptions: ['guest', {text: 'registered user', value: 'registeredUser'}],
        name: '',
        password: '',
        errorMessage: undefined,
        jwt: undefined
      }
    },
    computed: {
      showPassword: function () {
        return this.loginType === 'registeredUser';
      }
    },
    mounted() {
      console.log(`ROUTE params`, this.$route.params);
    },
    methods: {
      onSubmit(evt) {
        evt.preventDefault();
        this.errorMessage = undefined;
        this.$store.dispatch('authentication/authenticate', {
          loginType: this.loginType,
          username: this.name,
          password: this.password
        })
          .then(() => {
            console.log(`authentication worked. params: `, this.$route);
            if(this.$route.params.nextUrl !== undefined) {
              this.$router.push(this.$route.params.nextUrl)
            }
          },
            (err) => {
              console.err(err);
            });
      },
      testAuthToken() {
        const requestOptions = {};
        const token = this.$store.state.authentication.authToken;
        console.log(`token`, token);
        if (token !== undefined) {
          requestOptions.headers = {Authorization: `Bearer ${token}`};
        }
        console.log(`requestOptions`, requestOptions);
        axios.get('http://localhost:3000/api/securepathtest', requestOptions)
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
  }
</script>

<style scoped>

</style>
