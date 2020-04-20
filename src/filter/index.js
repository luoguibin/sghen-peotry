import Vue from 'vue'

export const userIconFilter = function(v) {
  let avatar = v || ''
  if (v instanceof Object) {
    avatar = v.avatar
  }
  if (avatar) {
    return '/sapi' + avatar.substr(1)
  } else {
    return process.env.NODE_ENV === 'production' ? '/peotry/favicon.ico' : './favicon.ico'
  }
}

export const timeFormat = function(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  // 2018-04-15T10:10:10+08:00
  date = new Date(date)
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  }

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }

  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}

Vue.filter('user-icon', userIconFilter)
Vue.filter('time-format', timeFormat)