import Vue from "vue"

let LVue
// 插件
// 1、实现一个 install 方法
class lVueRouter {
  // LVue会在这个里面进行使用
  constructor(options) {
    this.$options = options

    // 响应式数据：
    const initial = window.location.hash.slice(1) || '/'
    LVue.util.defineReactive(this, 'currentOne', initial)
    this.current = window.location.hash.slice(1) || '/'
    Vue.util.defineReactive(this, 'matched', [])
    // match 方法可以递归的遍历路由表，获得匹配关系
    this.match()


    // this.current = '/'

    // 监听事件：
    window.addEventListener('hashchange', this.onHashChange.bind(this)) // 通过 bind 将这个函数绑定到 lVueRouter 这个实例上面
    window.addEventListener('load', this.onHashChange.bind(this))


    
    // 缓存一下路由的映射关系：
    // 缓存path和route映射关系
    this.routeMap = {}
    this.$options.routes.forEach(route => {
      this.routeMap[route.path] = route
    })
  }

  onHashChange() {
    // console.log(this); 如果不绑定 this，那么这里的 this 就会变成 window
    this.current = window.location.hash.slice(1)

    this.matched = []
    this.match()
  }

  match(routes) {
    routes = routes || this.$options.routes
    
    // 递归遍历
    for (const route of routes) {
      // 一般不会在 / 路由那里配嵌套，如果配嵌套那么所有路由就会失效
      if (this.current == '/' && route.path == '/') {
        this.matched.push(route)
        return
      }
      // /about/info
      if (route.path !== '/' && this.current.indexOf(route.path) !== -1) {
        this.matched.push(route)
        if (route.children) {
          this.match(route.children)
        }
        return
      }
    }
  }

}

// 形参是 vue 的构造函数
lVueRouter.install = function(Vue) {
  // console.log(LVue);
  // 保存构造函数
  LVue = Vue

  // 1、挂载 $router
  Vue.mixin({
    beforeCreate() {
      // 全局混入，将来在组件实例化的时候才执行
      // 此时router实例是不是已经存在了
      // 在生命周期里面 this 指的是组件实例
      if (this.$options.router) {
        // 挂载
        Vue.prototype.$router = this.$options.router
      }
    }
  })
  console.log(Vue.util);

  // 2、实现两个全局组件
  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true
      }
    },
    render(h) {

      // jsx 也可以使用 --- 但不建议
      // return <a href={`#${this.to}`}>{this.$slots.default}</a>

      // <a href="#/xxx">xxx</a>
      // h(tag, props, children) --- h 函数更加通用
      return h('a', {attrs: {href: '#'+this.to}}, this.$slots.default)
    }
  })
  Vue.component('router-view', {
    // 每次渲染的时候 render 函数都要执行，这样写可能会废一些性能
    render(h) {
      // 1、获取路由器实例
      // 拿到路由表：
      // const routes = this.$router.$options.routes
      // // 拿到当前路由
      // const current = this.$router.current
      // const route = routes.find(item => item.path === current)
      // const comp = route ? route.component : null
      
      // 标记当前router-view深度：
      this.$vnode.data.routerView = true;

      let depth = 0;
      let parent = this.$parent;
      while(parent) {
        const vnodeData = parent.$vnode ?. data;
        if (vnodeData) {
          if (vnodeData.routerView) {
            // 说明当前 parent 是一个 router-view
            depth++;
          }
        }


        parent = parent.$parent;
      }


      // const  { routeMap, current } = this.$router
      // const comp = routeMap[current] ? routeMap[current].component : null

      // 获取path对应的component
      let component = null;
      const route = this.$router.matched[depth];
      if (route) {
        component = route
      }

      return h(component)
    }
  })
}

export default lVueRouter