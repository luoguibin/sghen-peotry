import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: JSON.parse(window.btoa(sessionStorage.getItem('sghen_user_info') || "") || "{}"),
    showBack: false,
    loginCount: 0,
    peotryCreate: 0
  },
  mutations: {
    setUser (state, user) {
      if (user) {
        sessionStorage.setItem('sghen_user_info', window.atob(JSON.stringify(user)))
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
    }
  }
})
