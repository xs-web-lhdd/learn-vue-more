/**
 * @description 利用 ES6 的 proxy 实现
 */

 const isObject = v => typeof v === 'object' && v !== null


 // 拦截：
 function reactive(obj) {
   if (!isObject(obj)) {
     return obj
   }
 
   return new Proxy(obj, {
     // 访问拦截：
     get(target, key, receiver) {
       const res = Reflect.get(target, key, receiver)
       console.log('get====>', key);
 
       // 依赖收集
       track(target, key)
 
       // 需要做递归处理：
       return isObject(res) ? reactive(res) : res;
     },
     // 新增、更新拦截：
     set(target, key, value, receiver) {
       const res = Reflect.set(target, key, value, receiver)
       console.log('set====>', key);
 
       // 触发副作用
       trigger(target, key)
 
       return res;
     },
     // 删除拦截：
     deleteProperty(target, key) {
       const res = Reflect.deleteProperty(target, key)
       console.log('deleteProperty====>', key);
 
       // 触发副作用
       trigger(target, key)
   
       return res;
     }
   })
 }
 
 
 // 临时存储副作用函数
 const effectStack = []
 
 // 副作用函数，建立传入的 fn 何其内部的依赖之间映射关系
 function effect(fn) {
   // 传入副作用函数，立即执行一次，执行 fn 触发依赖的 get 方法
   const e = createReactiveEffect(fn)
 
   // 立即执行
   e()
 
   return e
 }
 
 function createReactiveEffect(fn) {
   // 封装 fn：错误处理、保存到 stack
   const effect = function(...args) {
     try {
       // 入栈
       effectStack.push(effect)
       // 立即执行
       return fn(...args)
     } finally {
       // 出栈
       effectStack.pop()
     }
   }
   return effect
 }
 
 
 // 依赖收集
 const targetMap = new WeakMap()
 function track(target, key) {
   // 获取副作用函数
   const effect = effectStack[effectStack.length - 1]
   if (effect) {
     // 初始化时 target 这个 key 不存在，需要创建
     let depMap = targetMap.get(target)
     if (!depMap) {
       depMap = new Map()
       targetMap.set(target, depMap)
     }
 
     // 从 depMap 中获取副作用函数集合
     let deps = depMap.get(key)
     // 初始化时 deps 不存在
     if (!deps) {
       deps = new Set()
       depMap.set(key, deps)
     }
 
     // 放入新传入的副作用函数
     deps.add(effect)
   }
 }
 
 // 触发副作用
 function trigger(target, key) {
   // 获取 target, key 对应的 set
   const depMap = targetMap.get(target)
   if (!depMap) {
     return
   }
 
   const deps = depMap.get(key)
   if(deps) {
     // 循环执行内部所有的副作用函数
     deps.forEach(dep => dep())
   }
 }
 