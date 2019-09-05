import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'peotry',
      component: () => import(/* webpackChunkName: "home" */ './views/peotry-home')
    },
    {
      path: '*',
      redirect: '/home'
    }
  ]
})

router.beforeEach((to, from, next) => {
  // console.log("router.beforeEach()");
  next()
})

router.afterEach((to, from) => {
  // console.log("router.afterEach");
})

export default router
