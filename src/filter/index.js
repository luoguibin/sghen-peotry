import { baseUrl } from '@/api/config'

export const userIconFilter = function (v) {
  let iconUrl = v
  if (v instanceof Object) {
    iconUrl = v.iconUrl
  }
  if (iconUrl) {
    return baseUrl + iconUrl.substr(1)
  } else {
    return process.env.NODE_ENV === 'production' ? '/peotry/favicon.ico' : './favicon.ico'
  }
}

export const timeFormat = function (v) {
  // 2018-04-15T10:10:10+08:00
  return v.replace('T', ' ').replace('+08:00', '')
}
