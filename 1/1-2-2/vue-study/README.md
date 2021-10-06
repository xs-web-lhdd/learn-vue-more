# 资源
- vue-router官网：https://router.vuejs.org/zh/
- vuex官网：https://vuex.vuejs.org/zh/
- vue-router源码：https://github.com/vuejs/vue-router
- vuex源码：https://github.com/vuejs/vuex

## vue-router：
Vue Router 是 Vue.js 官方的路由管理器。它和Vue.js的核心深度集成，让构建单页面变得易如反掌。

安装： `vue add router`
核心步骤：
- 步骤一：使用vue-router插件，router.js
```js
import Router from 'vue-router'
Vue.use(Router)
```
- 步骤二：创建Router实例，router.js
```js
export default new Router({...})
```
- 步骤三：在跟组件上添加该实例，main.js
```js
import router from './router'
new Vue({
  router,
}).$mount('#app');
```
- 步骤四：添加路由视图，App.vue
```js
<router-view></router-view>
```
- 导航：
```js
<router-link to="/">Home</router-link>
<router-link to="/about">About</router-link>
```
```js
this.$router.push('/')
this.$router.push('/about')
```

### 学前问题：
1、在 Vue 中为什么要使用 use 方法？为什么？
VueRouter 是插件，插件的使用必须使用 use 方法

2、在 main.js 中将 router 引进来并写在 new Vue({}) 为什么就会起作用呢？
答案就是 use

3、路由的工作原理是什么？为什么 url 一变内容就能跟着变化呢？

4、this.$router 为什么可以访问Router实例？
Vue内部Vue.prototype.$router


### 需求分析：
- spa 点击链接不能刷新
 - hash #xxx
 - history  api 变化，但是浏览器不跳转
- 事件hashchange，发生事件后通知 router-view 进行更新
 - 利用 vue 数据响应式
 - 制造一个响应式的数据表示当前的 url ，在 router-view 的 render 函数中使用它（什么是响应式？当数据变化时，该组件的 render 函数会重新执行）

### 任务：
- 实现一个插件
  - 实现 VueRouter 类
  - 实现 install 方法
- 实现两个全局组件
  - 实现 router-link
  - 实现 router-view

### 实现一个插件有 VueRouter 类和 install 方法：
- 在vue-router中需要导出一个类，因此创建一个类叫lVueRouter。
```js
class lVueRouter {}
```
- 在Vue中实现插件必须实现一个install方法，也就是插件上面必须要有一个静态install方法。
```js
// 接收一个Vue的构造函数---怎么来的？？？
lVueRouter.install = function(Vue) {}
// 肯定是vue传过来的，所以需要做一个引用
// 在本代码中是声明一个LVue然后在下面函数中进行赋值
LVue = Vue // 保存构造函数
```
#### 挂载$router：
小坑：如何在install使用之前就拿到实例呢？？？
实行策略：
```js
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
```
因为是全局的混入，所以在写的时候要小心！有因为只需在跟组件实例中执行所以加一个判断条件
```js
// 只有根组件实例有 this.$options.router
if (this.$options.router) {
  // 有就挂载
  Vue.prototype.$router = this.$options.router
}
```
#### 全局组件的注册：
##### router-link：
```js
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
```
这个原理还是比较简单的，在h函数中形成一个a函数，然后将router-link里面的内容作为插槽内容放入a标签里面即可，将传过来的to作为prop进行接收。
##### router-view：
需要做一个响应式的 URL，如果不是响应式的URL，render函数不会重新执行。当URL是响应式的这样每次就会使render函数重新执行，这样就可以使视图发生变化。

###### 如何 URL 实现响应式：
```js
// 响应式数据：
const initial = window.location.hash.sli(1) || '/'
LVue.util.defineReactive(this, 'current', initial)

this.current = '/'

// 监听事件：
window.addEventListener('hashchange', this.onHashChange.bind(this))
// 通过 bind 将这个函数绑定到 lVueRouter 这个实例上面，原本 this 指向的是 window

// 监听 load 事件，防止用户直接排回车进行刷新
window.addEventListener('load', this.onHashChange.bind(this))

onHashChange() {
  // 拿到路由中 # 后面的部分
  this.current = window.location.hash.slice(1)
}
```
为了保证 current 是响应式的需要做一定处理：
```js
// 拿到路由表：
const routes = this.$router.$options.routes // 因为router-view是一个实例，因此可以在实例中调用this.$router拿到路由实例，然后 .routes 拿到路由表
// 拿到当前路由
const current = this.$router.current // 因为在上面 lVueRouter 中挂在过 current，因此在实例上可以拿到 current
// 看能不能匹配到路由表中的某一项，如果匹配到就返回该项的组件，如果没有就返回空
const route = routes.find(item => item.path === current)
const comp = route ? route.component : null
```
上面可以做一个小小的性能优化，如果每次render函数执行都执行上面的代码，那么没都要循环查找，这样就会造成性能的浪费，可以在实例上做一个映射：
```js
// 缓存一下路由的映射关系：
// 缓存path和route映射关系
this.routeMap = {}
this.$options.routes.forEach(route => {
  // 通过一个 forEach 循环，将path和route抓化成键值对存在一个对象里面，然后通过下面渲染时通过访问对象的形式拿到匹配路由里面的组件
  this.routeMap[route.path] = route
})
```
如何将 current 转换成响应式数据：！！！
```js
// 通过源码里的隐藏API设置current为响应式
LVue.util.defineReactive(this, 'current', initial)
```
详解：
这个方法适合给一个对象定义一个响应式的属性！！！
```js
Vue.util.defineReactive(obj,key,value,fn)  
// obj: 目标对象
// key: 目标对象属性
// value: 属性值
// fn: 只在node调试环境下set时调用
```

## vuex：
vuex **集中式**存储管理应用的所有组件的状态，并以相应的规则保证状态以**可预测**的方式发生变化。

vuex的设计理念：
- 1、集中式
- 2、可预测

### 核心概念：
- state 状态、数据
- mutations 更改状态的函数
- actions 异步操作
- store 包含以上概念的容器

### 状态 - state
state保存应用状态
```js
export default new Vuex.Store({
  state: { counter: 0 },
})
```

### 状态变更 - mutations
mutations 用于修改状态，store.js
```js
mutations: {
  add(state) {
    state.count++;
  }
}
```
### actions
执行异步的方法
```js
mutations: {
  add({commit}) {
    setTimeOut(() => {
      state.count++;
    }, 1000);
  }
}
```

#### 问题思考：？
- Vue.Store中的state是响应式的？怎么才能做到响应式
  答：通过 Vue 中的 data 实现响应式
- mutations里面add的参数state是怎么来的？
  答：state 是 vuex 构造函数实现 commit 方法时最后传进去的，其实质就是做过响应式处理的 state
- actions里面add的参数commit是那里来的？
  答：是 vuex 构造函数实现 dispatch 方法时最后传进去的 store 实例，因此可以从里面结构出 commit 方法

## vuex 原理解析：
### 任务：
- 插件
  - 挂载
  - 声明 Store 类
    - 响应式 state 状态
    - commit() 可以同步修改 state
    - dispatch() 可以异步修改 state
    - getters？
    
### 开始操作：
#### state实现响应式：
由Vuex的API使用方式我们知道，在使用Vuex的时候会往Store构造函数里面传state mutations actions 等等，所以需要Store里面的constructor的参数options接收他们，所以在options里面就可以拿到传过来的state，然后对state进行响应式的操作，如何进行响应式操作？在vue-router中用的是 `Vue.util.defineReactive()` 该方法适合给一个对象的某个属性设置成响应式，这里对state的响应式处理采用*借鸡生蛋*的方式。
###### 何为借鸡生蛋？
都知道Vue中的data里面的数据都是响应式的，那么在这里引入Vue的构造函数然后调用data方法，把state放入data中，那么state自然就变成响应式的了。这种想法很妙！

见代码：
```js
// 响应式的state
this.state = new LVue({
  data：options.state
})
```
上面的代码虽然响应式已经体现了，但是代码写的不是很安全，上面的写法会将state直接暴露给外边，这样就不太安全。

改进：
```js
// 把state进行隐藏
this._vm = new LVue({
  data: {
    // 加两层 $$ ,Vue中的代理属性就会消失
    $$data: options.state
  }
})

// 访问时进行操作
get state () {
  // 变成只读的属性
  return this._vm._data.$$data
}

// 当外界想直接 this.$store.state 进行修改state时就会报错,这样就提高了一定的安全性
set state(v) {
  console.error('please use replaceState to reset state');
}
```

#### 实现 commit 方法:
```js
// 在 constructor 中对 mutations 进行一个缓存
this._mutations = options.mutations


// commit(type, payload): 执行 mutation 修改状态
commit(type, payload) {
  // 根据 type ，获取对应的 mutations 
  const entry = this._mutations[type]
  if (!entry) {
    console.error('unknown mutaition type');
    return
  }
  // this.state 就是 constructor 里面的响应式数据 state
  entry(this.state, payload)
}
```
这样写就符合在使用 commit 时第一个参数是调用的函数名,第二个参数是传过去的参数.

#### 实现 dispatch 方法：
```js
// constructor 里面进行 this 绑定，绑定this到store实例，确保不出问题
const store = this
this.commit = this.commit.bind(store)


dispatch(type, payload) {
  console.log(payload);
  const entry = this._actions[type]
  if (!entry) {
    console.error('unknown action type');
    return
  }
  // 如果是 Promise 就要返回一个 Promise 的操作，因此要 return 一下
  return entry(this, payload)
}
```
看似跟 commit 差不多，实则细节慢慢
- 细节点一：将 `entry()` 函数返回，因为要在 dispatch 里面执行异步操作，如果异步是 Promise 那么就需要将 Promise 返回，因此将 `entry()` 函数返回
- `entry()` 里面参数 this 问题，在 actions 里面方法会接收一个上下文对象，也就是store的实例，这样可以从中结构出store的一些方法，如：commit 等，但是如果不进行绑定那么当 this 在actions 里面的一些方法中执行时可能无形中修改 this 的执行，这样就出BUG，因此在 constructor 进行进行 this 绑定很重要！

##### 思考题：
1、嵌套路由
- router-view 深度标记
- 路由匹配时获取代表深度层级的 matched 数组




