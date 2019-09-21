import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: (function() {
      const temp = sessionStorage.getItem('sghen_user_info') || ""
      return JSON.parse(window.decodeURIComponent(window.atob(temp)) || "{}")
    }()),
    extendDropMenus: [],
    showBack: false,
    loginCount: 0,
    peotryCreate: 0
  },
  mutations: {
    setUser (state, user) {
      if (user) {
        const temp = JSON.stringify(user) || ""
        sessionStorage.setItem('sghen_user_info', window.btoa(window.encodeURIComponent(temp)))
        state.user = user
      } else {
        sessionStorage.removeItem('sghen_user_info')
        state.user = {}
      }
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
      const menus = state.extendDropMenus;
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
    }
  },
  actions: {
    setUser (context, user) {
      context.commit('setUser', user)
    },
    showBack (context, showBack) {
      context.commit("showBack", showBack)
    },
    showLogin (context) {
      context.commit('showLogin')
    },
    showPeotryCreate (context) {
      context.commit('showPeotryCreate')
    },
    pushDropMenu (context, menu) {
      context.commit('pushDropMenu', menu)
    }
  }
})
