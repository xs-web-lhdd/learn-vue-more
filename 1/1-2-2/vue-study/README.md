# 资源
- vue-router官网：https://router.vuejs.org/zh/
- vuex官网：https://vuex.vuejs.org/zh/
- vue-router源码：https://github.com/vuejs/vue-router
- vuex源码：https://github.com/vuejs/vuex

## vue-router：
1、在 Vue 中为什么要使用 use 方法？为什么？
VueRouter 是插件，插件的使用必须使用 use 方法

2、在 main.js 中将 router 引进来并写在 new Vue({}) 为什么就会起作用呢？
答案就是 use

3、路由的工作原理是什么？为什么 url 一变内容就能跟着变化呢？


### 需求分析：
- spa 点击链接不能刷新
 - hash #xxx
 - history  api 变化，但是浏览器不跳转
- 事件，发生事件后通知 router-view 进行更新
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
```

## vuex 原理解析：
### 任务：
- 插件
  - 挂载
  - 声明 Store 类
    - 响应式 state 状态
    - commit() 可以修改 state
    - dispatch() 可以异步修改 state
    - getters？
    





