import { SCREEN_TYPE } from './constant'

/**
 * 屏幕类型工具
 */
export const ScreenTypeUtil = {
  init (root) {
    const listener = e => {
      root.$store.state.screenType = window.innerWidth < 500 ? SCREEN_TYPE.MOBILE : SCREEN_TYPE.PC
    }
    window.addEventListener('resize', listener)
    root.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', listener)
    })
  }
}

/**
 * 随机字符串
 * @param {Number} len
 */
export const randomString = (len = 5) => {
  const a = 97
  let str = ''
  for (let i = len; i > 0; --i) {
    const num = Math.floor(Math.random() * 26)
    str += String.fromCharCode(a + num)
  };
  return str
}
