import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Explorations from './views/Explorations.vue';
import D3WithVue from './views/explorations/D3WithVue.vue';
import D3WithVuePart2 from './views/explorations/D3WithVue-2.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/explorations',
      name: 'explorations',
      component: Explorations,
    },
    {
      path: '/explorations/d3-with-vue',
      name: 'd3with-vue',
      component: D3WithVue,
    },
    {
      path: '/explorations/d3-with-vue-2',
      name: 'd3with-vue-2',
      component: D3WithVuePart2,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
});
