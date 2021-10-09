## 手写vue
### 复习：vue全家桶原理剖析
https://www.processon.com/view/link/5e146d6be4b0da16bb15aa2a


MVVM框架的三要素：*数据响应式*、*模板引擎及其渲染*

数据响应式：监听数据变化并在视图中更新
- Object.defineProperty()
- Proxy

模板引擎：提供描述视图的模板语法
- 插值：{{}}
- 指令： v-bind、v-on、v-model、v-for、v-if

渲染：如何将模板转换为html
- 模板 => vdom => dom

### 数据响应式原理：
数据变更能够响应式在视图中，就是数据响应式。vue2中利用`object.defineProperty()`实现变更检测。

通过`Object.defineProperty()`实现属性的响应式：
```js
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      console.log('get===>', val);
    },
    set(newVal) {
      if (newVal !== val) {
        console.log('set===>', newVal);
        val = newVal;
      }
    }
  })
}

const obj = {}

defineReactive(obj, 'foo', 'foo')
obj.foo
obj.foo = 'foooooo'
```
上面的写法只能实现对象属性的响应式无法实现对象的响应式，需要改进：
```js
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      console.log('get===>', val);
    },
    set(newVal) {
      if (newVal !== val) {
        console.log('set===>', newVal);
        val = newVal;
      }
    }
  })
}



// 对象响应式处理
function observe(obj) {
  // obj 必须是一个对象
  if(typeof obj !== 'object' || obj === null) {
    return
  } 

  Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}

const obj = {a: 1, b: 2}

observe(obj)

obj.a = 'aaa'
obj.a
obj.b
```

上面的代码其实还有缺陷：如果在对象里面嵌套对象那么响应性就会失效，因此需要进行递归操作：
```js
function defineReactive(obj, key, val) {
  // val 可能是对象，那么就使用observe实现递归
  observe(val)

  Object.defineProperty(obj, key, {
    get() {
      console.log('get===>', val);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log('set===>', newVal);
        val = newVal;
      }
    }
  })
}



// 对象响应式处理
function observe(obj) {
  // obj 必须是一个对象
  if(typeof obj !== 'object' || obj === null) {
    return
  } 

  Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}

const obj = {a: 1, b: 2, baz: {a: 2}}
observe(obj)


obj.baz.a = 0
```

还有一种情形就是如果直接 obj.baz = {a: 100}，那么这种情况就无法被拦截到，改进代码：
```js
function defineReactive(obj, key, val) {
  // val 可能是对象，那么就使用observe实现递归
  observe(val)

  Object.defineProperty(obj, key, {
    get() {
      console.log('get===>', val);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log('set===>', newVal);
        observe(newVal)
        val = newVal;
      }
    }
  })
}



// 对象响应式处理
function observe(obj) {
  // obj 必须是一个对象
  if(typeof obj !== 'object' || obj === null) {
    return
  } 

  Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}

const obj = {a: 1, b: 2, baz: {a: 2}}
observe(obj)


obj.baz = {a: 100}
obj.baz.a = 0
```

这时还有一个问题就是如果给对象添加没有的属性如：`obj.dong = 'dong'`就不会去拦截，修改后的代码:
```js
function defineReactive(obj, key, val) {
  // val 可能是对象，那么就使用observe实现递归
  observe(val)

  Object.defineProperty(obj, key, {
    get() {
      console.log('get===>', val);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log('set===>', newVal);
        observe(newVal)
        val = newVal;
      }
    }
  })
}


function set(obj, key, val) {
  defineReactive(obj, key, val)
}


// 对象响应式处理
function observe(obj) {
  // obj 必须是一个对象
  if(typeof obj !== 'object' || obj === null) {
    return
  } 

  Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}

const obj = {a: 1, b: 2, baz: {a: 2}}
observe(obj)

// obj.dong = 'dong'
set(obj, 'dong', 'dong')
obj.dong
obj.dong = 'dong1'
```

### 在Vue中做数据响应式：
#### 原理分析：
1、`new Vue()`首先执行*初始化*，对*data执行响应式处理*，这个过程发生在Observer中
2、同时对模板执行编译，找到其中动态绑定的数据，从data中获取并初始化视图，这个过程发生在Complie中
3、同时定义一个更新函数和Watcher，将来对应数据变化时Watcher会调用更新函数
4、由于data的某个keys在一个视图中可能出现多次，所以每个key都需要一个管家Dep来管理多个Watcher
5、将来data中数据一旦发生变化，会首先找到对应的Dep，通知所有Watcher执行更新函数


#### 涉及类型介绍：
- LVue：框架构造函数
- Observer：执行数据响应化（分辨数据是对象还是数组）
- Compile：编译模板，初始化视图，收集依赖（更新函数、watcher创建）
- Watcher：执行更新函数（更新DOM）
- Dep：管理多个Watcher，批量更新


#### LVue :
框架构造函数：执行初始化
- 执行初始化，对data执行响应式处理，lvue.js
```js
function defineReactive(obj, key, val) {
  // val 可能是对象，那么就使用observe实现递归
  observe(val)

  Object.defineProperty(obj, key, {
    get() {
      console.log('get===>', val);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log('set===>', newVal);
        observe(newVal)
        val = newVal;
      }
    }
  })
}

// 对象响应式处理
function observe(obj) {
  // obj 必须是一个对象
  if(typeof obj !== 'object' || obj === null) {
    return
  } 

  new Observer(obj)
}

// 创建的框架
class LVue {
  constructor(options) {
    // 保存选项
    this.$options = options

    this.$data = options.data

    // 响应化处理
    observe(this.$data)

    // 代理：
    proxy(this)
  }
}

// 每一个响应式对象，半生一个Observer的实例
class Observer {
  constructor(value) {
    this.value = value

    // 判读value是obj还是数组
    this.walk(value)
  }

  walk(obj) {
    Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
  }
}
```

- 为 $data 做代理：
在模板中访问 `app.$data.counter++`，可以拿到data中的数据，但我们使用vue时直接使用`app.counter++`也能拿到数据，这是因为需要对*$data*进行一层代理：
```js
// 做一个代理，可以使用 app.count 访问
function proxy(vm) {
  Object.keys(vm.$data).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key]
      },
      set(newVal) {
        return vm.$data[key] = newVal
      }
    })
  })
}

// 创建的框架
class LVue {
  constructor(options) {
    ......
    // 代理：
    proxy(this)
  }
}
```

#### Compile - 编译:
```js
```