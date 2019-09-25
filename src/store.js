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
    extendDropMenus: [],
    showBack: false,
    loginCount: 0,
    scrollTopCount: 0,
    peotryCreate: 0,
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
    showPeotryCreate (state) {
      state.peotryCreate++
    },
    pushDropMenu (state, menu) {
      const menus = state.extendDropMenus
      const index = menus.findIndex(o => o.command === menu.command)
      if (index === -1) {
        if (!menu.remove) {
          menus.push(menu)
        }
      } else {
        if (menu.remove) {
          menus.splice(index, 1)
        }
      }
    },
    resetScrollTop (state) {
      state.scrollTopCount++
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
    showPeotryCreate (context) {
      context.commit('showPeotryCreate')
    },
    pushDropMenu (context, menu) {
      context.commit('pushDropMenu', menu)
    },
    resetScrollTop (context) {
      context.commit('resetScrollTop')
    }
  }
})
