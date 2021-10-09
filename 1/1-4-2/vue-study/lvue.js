function defineReactive(obj, key, val) {
  // val 可能是对象，那么就使用observe实现递归
  observe(val)

  // 每执行一次defineReactive,就创建一个Dep实例
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    get() {
      console.log('get===>', val);
      Dep.target && dep.addDep(Dep.target)
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log('set===>', newVal);
        observe(newVal)
        val = newVal;

        // 通知更新:
        // watchers.forEach(w => w.update())
        dep.notify()
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
    // 保存选项
    this.$options = options

    this.$data = options.data

    // 响应化处理
    observe(this.$data)

    // 代理：
    proxy(this)

    new Compile('#app', this)
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


// 编译过程

class Compile {
  constructor(el, vm) {
    this.$vm = vm

    // 传进来的 el 可能是一个选择器
    this.$el = document.querySelector(el)


    // 编译模板
    if (this.$el) {
      this.compile(this.$el)
    }
  }

  compile(el) {
    // 递归遍历 el
    // 判断其类型
    el.childNodes.forEach(node => {
      // 判断类型
      if(this.isElement(node)) {
        // console.log('这是元素', node.nodeName);
        this.compileElement(node)
      } else if (this.isInter(node)) {
        // console.log('这是插值表达式', node.textContent);
        this.compileText(node)
      }
      // 递归遍历
      if(node.childNodes) {
        this.compile(node)
      }
    })
  }


  // 判断属性值是不是指令：
  isDirective(attrName) {
    return attrName.indexOf('l-') === 0
  }

  // 编译文本
  compileElement(node) {
    // 获取节点属性的集合（注意：获取的是伪数组，不是真正的数组）
    const nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach(attr => {
      // l-xxx="aaa"
      const attrName = attr.name // l-xxx
      const exp = attr.value // aaa
      // 判断属性的类型
      // 是指令：
      if (this.isDirective(attrName)) {
        const dir = attrName.split('-')[1] // xxx
        // 执行指令
        this[dir] && this[dir](node, exp)
      }
    })
  }

  // 插值表达式的编译 --- 将插值表达式编译成真正的dom中的内容
  compileText(node) {
    // 获取匹配的表达式的值 --- 将 {{counter}} 变成 1
    // node.textContent = this.$vm[RegExp.$1]
    // 设置为响应式
    this.update(node, RegExp.$1, 'text')
  }

// 定义的指令:
  // 文本指令处理:
  text(node, exp) {
    // node.textContent = this.$vm[value]
    this.update(node, exp, 'text')
  }
  // html指令处理:
  html(node, exp) {
    // node.innerHTML = this.$vm[value]
    this.update(node, exp, 'html')
  }


  // 所有动态绑定都需要创建更新函数以及对应的watcher函数
  update(node, exp, dir) {
    // textUpdater
    // 初始化
    const fn = this[dir + 'Updater']
    fn && fn(node, this.$vm[exp])
    // 更新
    new Watcher(this.$vm, exp, function(val) {
      fn && fn(node, val)
    })
  }
  
  textUpdater(node, value) {
    node.textContent = value
  }

  htmlUpdater(node, value) {
    node.innerHTML = value
  }
  
  // 判断一个节点是否是元素
  isElement(node) {
    return node.nodeType === 1
  }

  // 判断一个节点是否是插值表达式
  isInter(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }
}

// const watchers = []
// Watcher: 小秘书,界面中一个依赖对应一个小秘书
class Watcher {
  constructor(vm, key, updateFn) {
    this.vm = vm
    this.key = key
    this.updateFn = updateFn

    // watchers.push(this)
    // 读一次数据,触发defineReactive里面的get()
    Dep.target = this
    this.vm[this.key]
    Dep.target = null
  }

  // 将来管家进行调用:
  update() {
    // 传入当前最新值给更新函数
    this.updateFn.call(this.vm, this.vm[this.key])
  }
}


class Dep {
  constructor() {
    this.deps = []
  }

  addDep(watcher) {
    this.deps.push(watcher)
  }

  // 通知方法:
  notify() {
    this.deps.forEach(watcher => watcher.update())
  }
}
