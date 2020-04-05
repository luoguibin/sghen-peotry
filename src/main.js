import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'

// 加载全局组件、过滤器、样式等配置
import './filter/index'
import './components/global/index'
import './style/index.scss'

// 加载进度
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
Vue.prototype.$nprogress = NProgress

// production模式直接引入cdn加载ui组件库
if (process.env.NODE_ENV !== 'production') {
  Vue.use(ElementUI)
  require('element-ui/lib/theme-chalk/index.css')
}
require('promise.prototype.finally').shim()

Vue.config.productionTip = false

new Vue({
  router,
  store,
  created() {
    this.$nprogress.configure({ showSpinner: false })
  },
  render: h => h(App)
}).$mount('#app')
