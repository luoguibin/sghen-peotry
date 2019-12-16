import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import PageHeader from './page/page-header'
import PageFooter from './page/page-footer'

import { userIconFilter } from './filter/index'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import './ui/element-ui'
import './ui/element-ui.css'
import './style/index.scss'

Vue.filter('user-icon', userIconFilter)
Vue.prototype.$NProgress = NProgress
Vue.component(PageHeader.name, PageHeader)
Vue.component(PageFooter.name, PageFooter)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  created () {
    NProgress.configure({ showSpinner: false })
  },
  render: h => h(App)
}).$mount('#app')
