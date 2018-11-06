import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
import Portal from './views/Portal.vue';
import Explorations from './views/Explorations.vue';
import Settings from './views/Settings.vue';
import D3WithVue from './views/explorations/D3WithVue.vue';
import D3WithVuePart2 from './views/explorations/D3WithVue-2.vue';

Vue.use(Router);
import store from '../src/store/store';

const loginRouteName = 'login'
const loginPath = `/${loginRouteName}`;
const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: loginPath,
      name: loginRouteName,
      component: Login,
    },
    {
      path: '/portal',
      name: 'portal',
      component: Portal,
      meta: {
        guest: true
      }
    },
    {
      path: '/explorations',
      name: 'explorations',
      component: Explorations,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'user']
      },
      children: [
        {
          path: 'd3-with-vue',
          name: 'd3with-vue',
          component: D3WithVue,
        },
        {
          path: 'd3-with-vue-2',
          name: 'd3with-vue-2',
          component: D3WithVuePart2,
        },
      ]
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: {
        requiresAuth: true,
        roles: ['admin']
      }
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

const validateAndRoute = function (checkRoute, tokenExists, userRoles) {
  if (checkRoute.matched.some(record => record.meta.requiresAuth)) {
    if (!tokenExists) {
      return {
        name: loginRouteName,
        params: {nextUrl: checkRoute.fullPath},
      };
    } else {
      if (!userRoles.some(r => checkRoute.matched.some(m => m.meta.roles.includes(r)))) {
        return {name: 'home'};
      }
    }
  } else if (checkRoute.matched.some(record => record.meta.guest)) {
    if (!tokenExists) {
      return {
        name: loginRouteName,
        params: {nextUrl: checkRoute.fullPath}
      };
    }
  }
};

router.beforeEach((to, from, next) => {
  next(validateAndRoute(to,
    store.state.authentication.authToken !== undefined,
    store.state.authentication.authenticatedUser !== undefined ?
      store.state.authentication.authenticatedUser.userRoles : []));
});

export default router;
export { validateAndRoute };
