import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import LoginDialog from '@/components/login-dialog'
Vue.use(ElementUI)

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
