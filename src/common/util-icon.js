import { baseUrl } from '@/api/config'

export const resetUserIconUrl = function (userInfo) {
  userInfo.iconUrl = userInfo.iconUrl
    ? baseUrl + userInfo.iconUrl.substr(1)
    : './favicon.ico'
}
