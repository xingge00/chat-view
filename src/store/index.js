
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      a: [],

    }
  },
  getters: {
    getA(state) {
      return state.a
    },
  },
  mutations: {
    setA(state, arr) {
      state.a = arr
    },

  },
  actions: {
    increment() {

    },

  },

})

export default store
