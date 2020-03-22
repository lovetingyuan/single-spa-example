import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Root from '../views/Root.vue'

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  base: '/',
  routes: [
    {
      path: process.env.SINGLE_APP ? process.env.SINGLE_APP_ROUTE : process.env.BASE_URL,
      component: Root,
      children: [
        {
          path: "/",
          name: "Home",
          component: Home
        },
        {
          path: "about",
          name: "About",
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () =>
            import(/* webpackChunkName: "about" */ "../views/About.vue")
        }
      ]
    },
  ]
});

export default router
