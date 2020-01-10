import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: (function () {
      const temp = sessionStorage.getItem('sghen_user_info') || ''
      return JSON.parse(window.decodeURIComponent(window.atob(temp)) || '{}')
    }()),
    screenType: 'screen-large', // screen-small,screen-middle,screen-large
    showBack: false,
    peotryOption: { type: '', data: '', key: '', count: 0 },
    loginCount: 0
  },
  mutations: {
    setUser (state, user) {
      if (user) {
        const temp = JSON.stringify(user) || ''
        sessionStorage.setItem('sghen_user_info', window.btoa(window.encodeURIComponent(temp)))
        state.user = user
      } else {
        sessionStorage.removeItem('sghen_user_info')
        state.user = {}
      }
    },
    setScreenType (state, type) {
      state.screenType = type
    },
    showBack (state, showBack) {
      state.showBack = showBack
    },
    showLogin (state) {
      state.loginCount++
    },
    setPeotryOption (state, e) {
      state.peotryOption.type = e.type
      state.peotryOption.data = e.data
      state.peotryOption.key = e.key
      state.peotryOption.count++
    }
  },
  actions: {
    setUser (context, user) {
      context.commit('setUser', user)
    },
    setScreenType (context, type) {
      context.commit('setScreenType', type)
    },
    showBack (context, showBack) {
      context.commit('showBack', showBack)
    },
    showLogin (context) {
      context.commit('showLogin')
    },
    setPeotryOption (context, e) {
      context.commit('setPeotryOption', e)
    }
  }
})
