import Vue from 'vue'

// 该文件下的同级组件将被统一注册为全局组件
// 不查询子目录、正则匹配vue文件
const requireComponent = require.context(
  './',
  false,
  /[A-Za-z-]\w+\.(vue)$/
)

requireComponent.keys().forEach(fileName => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName)
  const componentName = fileName
    .split('/')
    .pop()
    .replace(/\.\w+$/, '')
    .toLowerCase()

  // 全局注册组件
  Vue.component(
    componentName,
    componentConfig.default || componentConfig
  )
})