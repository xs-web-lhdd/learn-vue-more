import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

// 1、为什么用 use 方法？ 它做了什么？
// VueRouter 是插件，插件的使用必须使用 use 方法
Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
