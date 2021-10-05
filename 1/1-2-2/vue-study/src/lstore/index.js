import Vue from 'vue'
import Vuex from './lvuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    counter: 1,
  },
  mutations: {
    add(state) {
      // state 哪来的？state 是响应式，怎么做才能做到响应式？
      state.counter++
    }
  },
  actions: {
    // 参数怎么来的？
    add({ commit }) {
      // 业务逻辑组合或者异步
      setTimeout(() => {
        commit('add')
      }, 1000);
    }
  },
  // modules: {
  // }
})
