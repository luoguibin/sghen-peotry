export const ScreenType = {
  MOBILE: 1,
  PC: 2,
  init (root) {
    const listener = e => {
      root.$store.state.screenType = window.innerWidth < 500 ? this.MOBILE : this.PC
    }
    window.addEventListener('resize', listener)
    root.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', listener)
    })
  }
}
