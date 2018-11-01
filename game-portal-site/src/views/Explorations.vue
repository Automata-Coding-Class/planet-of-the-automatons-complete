<template>
  <div class="explorations">
      <div class="content main">
          <h1>Explorations</h1>
          <h2>D3.js</h2>
          <ul>
              <li>
                  <router-link to="/explorations/d3-with-vue">D3 with Vue.js - Part I</router-link>
              </li>
              <li>
                  <router-link to="/explorations/d3-with-vue-2">D3 with Vue.js - Part II</router-link>
              </li>
          </ul>
          <router-view></router-view>
      </div>
  </div>
</template>

<script>
  // @ is an alias to /src

  export default {
    name: 'explorations',
    components: {},
  }
</script>
