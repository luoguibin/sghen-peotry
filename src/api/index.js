import request from './axios'
import { MD5, enc } from 'crypto-js'

export const getPageConfig = () =>
  request({
    url: '/sapi/v1/common/page-config',
    method: 'get'
  })

export const createUser = data =>
  request({
    url: '/sapi/v1/user/create',
    method: 'post',
    data
  })

export const sendSmsCode = data =>
  request({
    url: '/sapi/v1/sms/send',
    method: 'post',
    data
  })

export const loginByAccount = data => {
  if (data.pw) {
    data.pw = enc.Base64.stringify(MD5(data.pw))
  }
  // console.log(pw0);
  return request({
    url: '/sapi/v1/user/login',
    method: 'post',
    data
  })
}

export const updateUser = data =>
  request({
    url: '/sapi/v1/user/update',
    method: 'post',
    data
  })

export const queryUsers = ids =>
  request({
    url: '/sapi/v1/user/query-list',
    method: 'get',
    params: {
      idStrs: ids.toString()
    }
  })

export const queryPeotries = params =>
  request({
    url: '/sapi/v1/peotry/query',
    method: 'get',
    params
  })

export const queryPopularPeotries = params =>
  request({
    url: '/sapi/v1/peotry/query-popular',
    method: 'get',
    params
  })

export const queryPeotrySets = userId =>
  request({
    url: '/sapi/v1/peotry-set/query',
    method: 'get',
    params: {
      userId
    }
  })

export const createPeotry = peotry =>
  request({
    url: '/sapi/v1/peotry/create',
    method: 'post',
    data: peotry
  })

export const updatePeotry = peotry =>
  request({
    url: '/sapi/v1/peotry/update',
    method: 'post',
    data: peotry
  })

export const deletePeotry = (id, userId) =>
  request({
    url: '/sapi/v1/peotry/delete',
    method: 'post',
    data: { id, userId }
  })

export const addTempPeotry = data =>
  request({
    url: '/sapi/v1/peotry/add-temp',
    method: 'post',
    data
  })

export const createComment = data =>
  request({
    url: '/sapi/v1/comment/create',
    method: 'post',
    data
  })

export const deleteComment = data =>
  request({
    url: '/sapi/v1/comment/delete',
    method: 'post',
    data
  })

export const createPoetrySet = data =>
  request({
    url: '/sapi/v1/peotry-set/create',
    method: 'post',
    data
  })

export const deletePeotrySet = data =>
  request({
    url: '/sapi/v1/peotry-set/delete',
    method: 'post',
    data
  })

export const uploadFiles = (params, data) =>
  request({
    url: '/sapi/v1/upload',
    method: 'post',
    params,
    data,
    timeout: 33000,
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const queryDynamicApi = params =>
  request({
    url: '/sapi/v1/api/query',
    method: 'get',
    params
  })

export const createDynamicApi = data =>
  request({
    url: '/sapi/v1/api/create',
    method: 'post',
    data
  })

export const updateDynamicApi = data =>
  request({
    url: '/sapi/v1/api/update',
    method: 'post',
    data
  })

export const deleteDynamicApi = data =>
  request({
    url: '/sapi/v1/api/delete',
    method: 'post',
    data
  })

export const getDynamicData = params => {
  return request({
    url: '/sapi/v1/api/get/' + params.suffixPath,
    method: 'get',
    params
  })
}

export const postDynamicData = data => request({
  url: '/sapi/v1/api/post',
  method: 'post',
  data
})

/**
 * 获取热门诗词选集
 * @param {Object} params
 */
export const getPopularPoetrySets = params => request({
  url: '/sapi/v1/api/get/peotry-set/popular',
  method: 'get',
  params
})

/**
 * 获取年度诗词选集
 * @param {Object} params
 */
export const getYearPoetrySets = params => request({
  url: '/sapi/v1/api/get/peotry-set/list-year',
  method: 'get',
  params
})

/**
 * 根据年度诗词创建数获取诗词作者列表
 * @param {Object} params
 */
export const getYearPoets = params => request({
  url: '/sapi/v1/api/get/peotry-user/list-year',
  method: 'get',
  params
})

/**
 * 获取诗词词频列表
 * @param {Object} params
 */
export const getPeotryHotWords = params => request({
  url: '/sapi/v1/api/get/peotry/hot-word',
  method: 'get',
  params
})
