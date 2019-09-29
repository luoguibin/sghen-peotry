import { baseUrl } from '@/api/config'

export const userIconFilter = function (v) {
  let iconUrl = v
  if (v instanceof Object) {
    iconUrl = v.iconUrl
  }
  if (iconUrl) {
    return baseUrl + iconUrl.substr(1)
  } else {
    return '/peotry/favicon.ico'
  }
}
