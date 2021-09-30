import Vue from 'vue'
// import App from './App.vue'
// import App from './components/communication/index.vue'
// import App from './components/form-practice/index.vue'
import App from './components/form-practice-more/index.vue'

Vue.config.productionTip = false
// 事件总线
Vue.prototype.$bus = new Vue()

new Vue({
  render: h => h(App),
}).$mount('#app')
