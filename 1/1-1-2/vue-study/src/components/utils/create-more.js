// 传入一个组件配置
// 并将其挂载到 body 上面

import Vue from 'vue'


export default function create (Component, props) {
  // 创建实例
  // 方式一：Vue.extened
  const Ctor = Vue.extend(Component)
  // 创建组件实例：
  const comp = new Ctor({propsData: props})
  comp.$mount()
  document.body.appendChild(comp.$el)
  comp.remove = () => {
    document.body.removeChild(comp.$el)
    comp.$destroy()
  }

//   // 方式二：借鸡（Vue）生蛋（组件实例）：
//   const vm = new Vue({
//     render(h) {
//       return h(Component, { props })
//     }
//   }).$mount()
// // #mount 本质作用：将虚拟 DOM 转换为真实 DOM

//   document.body.appendChild(vm.$el)

// // 但不使用的时候进行删除：
//   const comp = vm.$children[0]
//   comp.remove = () => {
//     document.body.removeChild(vm.$el)
//     vm.$destroy()
//   }

  return comp
}