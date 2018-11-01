<template>
  <div class="login">
      <div class="content main">
          <Login></Login>
      </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Login from '@/components/shared/Login.vue';

export default {
  name: 'home',
  components: {
    Login
  },
};
</script>
