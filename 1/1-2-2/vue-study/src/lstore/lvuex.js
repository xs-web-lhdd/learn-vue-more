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
  }
  get state () {
    return this._vm._data.$$data
  }


  set state(v) {
    console.error('please use replaceState to reset state');
  }

  // commit(type, payload): 执行 mutation 修改状态
  commit(type, payload) {
    console.log(type);
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
    console.log(payload);
    const entry = this._actions[type]
    if (!entry) {
      console.error('unknown action type');
      return
    }
    return entry()
  }

}


function install (Vue) {
  LVue = Vue

  // 混入
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}


// 此处导出的对象理解为 vuex
export default { Store, install }
