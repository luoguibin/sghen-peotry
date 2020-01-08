import request from './axios'
import { MD5, enc } from 'crypto-js'

export const createUser = data =>
  request({
    url: '/v1/user/create',
    method: 'post',
    data
  })

export const sendSmsCode = data =>
  request({
    url: '/v1/sms/send',
    method: 'post',
    data
  })

export const loginByAccount = ({ id, pw }) => {
  const pw0 = enc.Base64.stringify(MD5(pw))
  // console.log(pw0);
  return request({
    url: '/v1/user/login',
    method: 'post',
    data: {
      id,
      pw: pw0
    }
  })
}

export const updateUser = data =>
  request({
    url: '/v1/user/update',
    method: 'post',
    data
  })

export const queryUsers = ids =>
  request({
    url: '/v1/user/query-list',
    method: 'get',
    params: {
      idStrs: ids.toString()
    }
  })

export const queryPeotries = params =>
  request({
    url: '/v1/peotry/query',
    method: 'get',
    params
  })

export const queryPopularPeotries = params =>
  request({
    url: '/v1/peotry/query-popular',
    method: 'get',
    params
  })

export const queryPeotrySets = userId =>
  request({
    url: '/v1/peotry-set/query',
    method: 'get',
    params: {
      userId
    }
  })

export const createPeotry = peotry =>
  request({
    url: '/v1/peotry/create',
    method: 'post',
    data: peotry
  })

export const updatePeotry = peotry =>
  request({
    url: '/v1/peotry/update',
    method: 'post',
    data: peotry
  })

export const deletePeotry = (id, userId) =>
  request({
    url: '/v1/peotry/delete',
    method: 'post',
    data: { id, userId }
  })

export const createComment = data =>
  request({
    url: '/v1/comment/create',
    method: 'post',
    data
  })

export const deleteComment = data =>
  request({
    url: '/v1/comment/delete',
    method: 'post',
    data
  })

export const createPoetrySet = data =>
  request({
    url: '/v1/peotry-set/create',
    method: 'post',
    data
  })

export const deletePeotrySet = data =>
  request({
    url: '/v1/peotry-set/delete',
    method: 'post',
    data
  })

export const uploadFiles = (params, data) =>
  request({
    url: '/v1/upload',
    method: 'post',
    params,
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const getHotWords = () =>
  request({
    baseURL: 'http://japi.sghen.cn',
    url: '/api/analyze/wordfrequency/sghen_db/peotry/content',
    method: 'get'
  })

export const queryDynamicApi = params =>
  request({
    url: '/v1/api/query',
    method: 'get',
    params
  })

export const createDynamicApi = data =>
  request({
    url: '/v1/api/create',
    method: 'post',
    data
  })

export const updateDynamicApi = data =>
  request({
    url: '/v1/api/update',
    method: 'post',
    data
  })

export const deleteDynamicApi = data =>
  request({
    url: '/v1/api/delete',
    method: 'post',
    data
  })

export const getDynamicData = params => {
  return request({
    url: '/v1/api/get/' + params.suffixPath,
    method: 'get',
    params
  })
}

export const postDynamicData = data => request({
  url: '/v1/api/post',
  method: 'post',
  data
})
