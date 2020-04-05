export const baseUrl = process.env.NODE_ENV === 'production' ? 'https://www.sghen.cn/sapi' : 'http://localhost:8085'

/**
 * 诗词图片路径前缀
 */
export const imagePrefixxPath = process.env.NODE_ENV === 'production' ? 'https://www.sghen.cn/sapi/file/peotry/img/' : 'http://localhost/peotry/images/'
