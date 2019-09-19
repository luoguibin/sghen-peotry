import { baseUrl } from '@/api/config'

export const resetUserIconUrl = function (userInfo) {
  userInfo.iconUrl = userInfo.iconUrl
    ? baseUrl + "/peotry" + userInfo.iconUrl.substr(1)
    : '/peotry/favicon.ico'
}
