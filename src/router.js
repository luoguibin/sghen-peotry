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
      path: '/blank',
      name: 'blank'
    },
    {
      path: '/home',
      name: 'home',
      component: () => import(/* webpackChunkName: "home" */ './page/page-home')
    },
    {
      path: '/peotry-list',
      name: 'peotry-list',
      component: () => import(/* webpackChunkName: "peotry-list" */ './views/peotry-list')
    },
    {
      path: '/api-manage',
      name: 'api-manage',
      component: () => import(/* webpackChunkName: "api-manage" */ './views/api-manage')
    },
    {
      path: '/new-year',
      name: 'new-year',
      component: () => import(/* webpackChunkName: "new-year" */ './views/new-year')
    },
    {
      path: '*',
      redirect: '/home'
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    return savedPosition || { x: 0, y: 0 }
  }
})

router.beforeEach((to, from, next) => {
  // console.log("router.beforeEach()");
  next()
})

router.afterEach((to, from) => {
  // console.log("router.afterEach");
})

export default router
