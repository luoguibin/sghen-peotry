import axios from 'axios'
import Qs from 'qs'
import store from '@/store'
import { Message } from 'element-ui'

axios.defaults.timeout = 10000

axios.interceptors.request.use(
  config => {
    const token = store.state.user.token
    if (token) {
      config.headers['Authorization'] = token
    }
    if (config.params && config.params.origin) {
      delete config.params.origin
      return config
    }
    if (config.data) {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        config.data = Qs.stringify(config.data)
      }

      if (!config.params) {
        config.params = {}
      }
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  res => {
    const status = Number(res.status) || 0
    const data = res.data || {}
    if (status !== 200 || data.code !== 1000) {
      Message.error({ message: data.msg || '操作失败' })
      return Promise.reject(res)
    }
    if (data.code === 999) {
      Message.error({ message: data.msg || '服务器维护中' })
      return Promise.reject(res)
    }

    return res
  },
  error => {
    Message.error({ message: error })
    return Promise.reject(new Error(error))
  }
)

export default axios
