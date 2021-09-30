import Vue from 'vue'
import App from './App.vue'


// import router from './router'
import router from './lrouter'

// import store from './store'
import store from './lstore'


// new Vue是根实例
// App是根组件
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
