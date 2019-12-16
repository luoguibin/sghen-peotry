import { SCREEN_TYPE }  from './constant'

export const ScreenType = {
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
