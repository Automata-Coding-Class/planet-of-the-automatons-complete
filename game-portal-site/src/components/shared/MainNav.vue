<template>
    <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/portal">Portal</router-link>
        <router-link to="/explorations">Explorations</router-link>
        <router-link to="/settings">Settings</router-link>
        <router-link to="/about">About</router-link>
    </nav>
</template>

<script>
  export default {
    name: "MainNav",
    data() {
      return {
        routeMap: undefined
      }
    },
    mounted() {
      const routeMap = new Map();
      this.$router.options.routes.forEach(route => {
        if(route.meta !== undefined) {
          routeMap.set(route.path, route.meta);
        }
      });
      this.routeMap = routeMap;
      this.setLinkVisibility();
    },
    computed: {
      currentUserRoles() {
        return this.$store.state.authentication.authenticatedUser !== undefined ?
          this.$store.state.authentication.authenticatedUser.userRoles :
          [];
      }
    },
    methods: {
      setLinkVisibility() {
        const userRoles = this.currentUserRoles;
        this.$children.forEach(child => {
          if((/router-link$/i).test(child.$vnode.tag)) {
            const linkPath = child._props.to;
            if(this.routeMap.has(linkPath)) {
              const metaData = this.routeMap.get(linkPath);
              console.log(`${linkPath} metaData:`, metaData);
              if(metaData.guest && this.$store.state.authentication.authToken !== undefined) {
                child.$el.hidden = false;
              } else if (metaData.requiresAuth && metaData.roles !== undefined && userRoles !== undefined) {
                child.$el.hidden = !metaData.roles.some(r => userRoles.includes(r));
              } else {
                child.$el.hidden = true;
              }
            }
          }
        })
      }
    },
    watch: {
      currentUserRoles() {
        this.setLinkVisibility();
      }
    }
  }
</script>

<style scoped>

</style>
