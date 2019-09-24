import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import PageHeader from './page/page-header'
import PageFooter from './page/page-footer'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import './common/element-ui'
import './style/element-ui.css'

Vue.component(PageHeader.name, PageHeader)
Vue.component(PageFooter.name, PageFooter)
Vue.prototype.$NProgress = NProgress

Vue.config.productionTip = false

new Vue({
  router,
  store,
  created () {
    NProgress.configure({ showSpinner: false })
  },
  render: h => h(App)
}).$mount('#app')
