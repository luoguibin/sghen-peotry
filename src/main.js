import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import PageFooter from './components/page-footer'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import './common/element-ui'

import LoginDialog from '@/components/login-dialog'
Vue.component(PageFooter.name, PageFooter)

Vue.config.productionTip = false

Vue.prototype.$NProgress = NProgress
Vue.component(LoginDialog.name, LoginDialog)

new Vue({
  router,
  store,
  created () {
    NProgress.configure({ showSpinner: false })
  },
  render: h => h(App)
}).$mount('#app')
