import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      id: 0,
      name: '',
      iconUrl: '',
      token: ''
    },
    loginCount: 0,
    peotryCreate: 0
  },
  mutations: {
    setUser (state, user) {
      if (user) {
        sessionStorage.setItem('sghen_user_info', JSON.stringify(user))
        state.user = user
      } else {
        sessionStorage.removeItem('sghen_user_info')
        state.user = {
          id: 0,
          name: '',
          iconUrl: '',
          token: ''
        }
      }
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
    showLogin (context) {
      context.commit('showLogin')
    },
    showPeotryCreate (context) {
      context.commit('showPeotryCreate')
    }
  }
})
