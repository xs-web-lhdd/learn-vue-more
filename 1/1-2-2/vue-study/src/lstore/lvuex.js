// 实现插件
let LVue

// 实现 Store 的类

class Store {
  constructor(options) {
    // 响应式的state
    this._vm = new LVue({
      data: {
        $$data: options.state
      }
    })

    // 保存 mutations 
    this._mutations = options.mutations
    // 缓存 actions
    this._actions = options.actions

    // 绑定this到store实例，确保不出问题
    const store = this
    this.commit = this.commit.bind(store)
// 源码写法：--- 原理就是将 this 绑定到store实例上，防止后面传this的时候因作用域的情况出BUG，意思跟上面代码意思相同
    // const { commit, action } = store
    // this.commit = function boundCommit (type, payload) {
    //   return commit.call(store, type, payload)
    // }
    // this.action = function boundCommit (type, payload) {
    //   return action.call(store, type, payload)
    // }
  }
  get state () {
    return this._vm._data.$$data
  }


  set state(v) {
    console.error('please use replaceState to reset state');
  }

  // commit(type, payload): 执行 mutation 修改状态
  commit(type, payload) {
    // 根据 type ，获取对应的 mutations 
    const entry = this._mutations[type]
    if (!entry) {
      console.error('unknown mutaition type');
      return
    }
    entry(this.state, payload)
  }

  // dispatch(type, payload)
  dispatch(type, payload) {
    const entry = this._actions[type]
    if (!entry) {
      console.error('unknown action type');
      return
    }
    // 如果是 Promise 就要返回一个 Promise 的操作，因此要 return 一下
    return entry(this, payload)
  }

}

// 实现插件
function install (Vue) {
  LVue = Vue

  // 混入
  Vue.mixin({
    beforeCreate() {
      // this.$options.store 是 main.js 里面 new Vue({}) 传进去的参数
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}


// 此处导出的对象理解为 vuex
export default { Store, install }
