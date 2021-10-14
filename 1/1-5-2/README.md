### 调试环境搭建：

- 安装依赖： `npm i`
- 安装rollup：`npm i -g rollup`
- 修改dev脚本，添加sourcemap，package.json

```js
    "dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:web-full-dev",
```

- 运行开发命令：`npm run dev`
- 引入前面创建的vue.js，samples/commits/index.html

```html
<script src="../../dist/vue.js"></script>
```

> 术语解释：
>
> - runtime：仅包含运行时，不包含编译器，体积较小，是运行时版本
> - common：cjs规范，用于webpack1
> - esm：ES模块，用于webpack2+
> - umd：universal module definition，兼容cjs和amd，用于浏览器，用script标签直接引用

**注意**：在配置环境时的路径不要有中文名称！！！

### 调试技巧：

- ctrl + p ：打开指定文件
- 断点
- 单步执行：查看每一步干了什么事情
- 查看调用栈 ：看文件在堆栈中的调用顺序，方便疏清逻辑

### 文件结构：

```bash
Vue
	.circleci
	.github
	benchmarks
	dist	发布目录
	examples	范例，里面有测试代码
	flow	试代码
	packages	核心代码之外的独立库
	scripts		构建脚本
	src		源码
	test
	types	ts类型声明，上面flow是针对flow的类型声明
	.babelrc.js
	.editorconfig
	.eslintignore
	.eslintrc.js
	.flowconfig
	.gitignore
	BACKERS.md
	LISCNSE
	package.json
	README.md
	yarn.lock
```

源码目录：

```bash
src
	compiler	编译器相关
	core	核心代码，要常来这里看看
		components 通用组件如：keep-alive
		global-api	全局API
		instance	构造函数等
		observer	响应式相关
		util
		vdom 	虚拟DOM相关
		config.js
		index.js
	platforms
		web
		weex
	server
	sfc
	shared
```



### 入口：

dev脚本中`-c scripts/config.js`指明配置文件所在

参数`TARGET:web-full-dev`指明输出文件配置项，line：123

```js
  // Runtime+compiler development build (Browser)
  'web-full-dev': {
    // 携带编译器的入口文件：
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.js'),
    format: 'umd',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
```

### 初始化流程：

#### 整体流程：

- new Vue()
  - _init()
- $mount()
  - mountComponent()  ---  挂载的执行
    - updateComponent()
      - render()
      - update()
    - new Watcher

> 生命周期：https://cn.vuejs.org/v2/guide/instance.html?#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%BE%E7%A4%BA

> 测试用例：examples/test/01-test.html

##### el template render 这三者谁的优先级最高？

答：render > template > el;

在源码的web/entry-runtime-with-compiler.js中可以得到答案，line：34，

```js
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        // 设置 template 的方式是以 # 开头
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
        // 设置 template 的方式是 DOM 元素
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // 把 el 的 OuterHTML 做为模板
      template = getOuterHTML(el)
    }
    // 获取模板之后执行编译：
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
	  // 编译目标：获取渲染函数（渲染函数、静态渲染函数），无论是el 还是 template 最终都是转换为render（）方法
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
    // 执行默认挂载功能：
    return mount.call(this, el, hydrating)
  }
```

如果有render就执行render，如果没有render才执行template，如果连template也没有就执行el

> 这里还有一个细节：是先编译compiler还是先挂载mount？
>
> 其实从上面那段代码那里就能得出结果，是先编译然后进行挂载



##### new Vue 发生了什么？

**platforms/web/entry-runtime-with-compiler.js**:（这个是入口文件）

- 扩展 $mount
- 处理 el、template 等选项，里面有编译

**platforms\web\runtime\index.js**：

- 安装 web 平台特有的指令和组件

- 定义 \__patch__：补丁函数，执行 patching 算法进行更新
- 定义 $mount 这个方法（具体作用：实现挂载）：挂载vue实例到指定的宿主元素（获得dom并替换宿主元素），具体方法是 - mountComponent()

**src\core\index.js**：

- 初始化全局API --- `initGlobalAPI(Vue)`

  - 例：进入`initGlobalAPI(Vue)`这个文件里面在37行就能找到之前用的Vue隐藏响应式API：`Vue.util.defineReactive`这个函数，文件位置：**src\core\global-api\index.js**，里面还有熟悉的 `Vue.set`,`Vue.del`,`Vue.nextTick`等方法
  - 例：在`initGlobalAPI(Vue)`中找到`initUse(Vue)`然后进入**src\core\global-api\use.js**就能找到Vue中插件的使用Vue.use这个静态方法：

  ```js
  import { toArray } from '../util/index'
  
  export function initUse (Vue: GlobalAPI) {
    // 插件的具体的实现函数：
    Vue.use = function (plugin: Function | Object) {
      const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
      if (installedPlugins.indexOf(plugin) > -1) {
        return this
      }
  
      // additional parameters
      // 平常的写法： Vue.use(MyPlugin, arg1, arg2, ....)
      // 平常写的时候传一个 class，class 本身就是一个函数
      const args = toArray(arguments, 1)
    	// 在参数前面追加 Vue 的实例，这样就明白了为什么在使用install方法时第一个参数是Vue的实例
      args.unshift(this)
      // 判断传进来的插件有没有install这个方法，如果有直接执行，如果没有直接执行插件这个方法
      if (typeof plugin.install === 'function') {
        plugin.install.apply(plugin, args)
      } else if (typeof plugin === 'function') {
        plugin.apply(null, args)
      }
      installedPlugins.push(plugin)
      return this
    }
  }
  ```
  
  **src\core\instance\index.js**：
  
  - 作用1：实现Vue构造函数 --- line：8
  - 作用2：实现vue实例方法的初始化 --- line：17-22
  
  这个里面的 Vue 是真正的构造函数，执行实例方法的初始化：
  
  ```js
  // 实现真正的 Vue 构造函数：
  function Vue (options) {
    if (process.env.NODE_ENV !== 'production' &&
      !(this instanceof Vue)
    ) {
      warn('Vue is a constructor and should be called with the `new` keyword')
    }
    // 这个 _init 方法是那里来的？  
    this._init(options)
    // 是通过下面的 initMixin 实现混入的
  }
  
  // 混入 _init()，上面 Vue 方法中的 this._init 就是在这里面实现的
  initMixin(Vue)
  // 实现和状态相关的 $set/$delete/$watch 这些方法
  stateMixin(Vue)
  // 实现 $emit/$on/$off/$once 这些和事件监听相关的方法
  eventsMixin(Vue)
  // 和生命周期相关的方法：_update、$forceUpdate、$destroy
  lifecycleMixin(Vue)
  // 和渲染相关的方法：$nextTick、_render
  renderMixin(Vue)
  ```
  
  - `initMixin(Vue)`核心代码：
    - 初始化过程：组件属性、事件等初始化、两个生命周期钩子、数据的响应式

```js
    // 核心初始化逻辑:
    vm._self = vm
    initLifecycle(vm) // $parent/$root(祖宗已经有了) /$children(已经初始化了但是空的)
    initEvents(vm) // 一些事件的监听
    initRender(vm) // 插槽/$createElement
    // 组件创建之前的钩子: 在这里面能够访问的东西很有限，可以在这里面弄一些数据，但是这些数据都不是响应式的
    callHook(vm, 'beforeCreate')
    initInjections(vm) // 注入祖辈传递的数据
    initState(vm) // 重要:组件数据的初始化---包括 props data methods computed watch
    initProvide(vm) // 把数据给子代
    callHook(vm, 'created') // 组件创建后的钩子

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
	// 有 el 直接就自动调用 $mount 了
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
```

问：

- 为什么先 `initInjections(vm)` 再 `initProvide(vm)`？因为从父辈继承过来的数据可能会传递给子代，所以需要先`initInjections`后`initProvide`
- 为什么vue在使用时数据要在`created` 或者`mounted`钩子函数中进行操作？因为在这阶段中数据已经初始化完毕了可以对数据进行操作
- 为什么用户设置**el**选项后不需要手动调用$mount也能挂载到实例上？因为vue会自行判断如果有el就自动调用$mount因此无需调用也能挂载到实例上面

##### $mount

**-** **mountComponent**

执行挂载，获取vdom并转换为dom，src\core\instance\lifecycle.js

**-** **new Watcher()**

创建组件渲染watcher，src\core\instance\lifecycle.js

**-** **updateComponent()**

执行初始化或更新

**-** **update()**

初始化或更新，将传入vdom转换为dom，初始化时执行的是dom创建操作，src\core\instance\lifecycle.js

**-** **render()**

渲染组件，获取vdom，src/core/instance/render.js



#### 整体流程捋一捋：

new Vue() => _init() => $mounted =>mountComponent() =>

new Watcher() => updateComponent() => render() => _update()



>思考一道面试题：谈谈vue生命周期
>
>- 概念：组件创建、更新和销毁过程
>- 用途：生命周期钩子使我们可以在合适时间做合适的事
>- 分类列举：
>  - 初始化阶段：beforeCreate、created、beforeMount、mounted
>  - 更新阶段：beforeUpdate、updated
>  - 销毁阶段：beforeDestroy、destroyed
>- 应用：
>  - created：所有数据准备就绪，适合做数据获取、赋值等数据操作
>  - mounted：$el已经生成，可以获取dom，子组件也已挂载，可以访问它们
>  - updated：数值变化已经作用域dom，可以获取dom最新状态
>  - destroyed：组件实例已经销毁，适合取消定时器等操作

### 数据响应式：

​	数据响应式是MVVM框架的一大特点，通过某种策略可以感知数据的变化。Vue中利用JS语言特性`Object.defineProperty()`，通过定义对象属性 getter/setter 拦截对属性的访问。

​	具体实现是在Vue初始化时，会调用initState，它会初始化data，props等，这里着重关注data初始化。

#### 整体流程：

**initState  src/core/instance/state.js**

初始化数据，包括 props、methods、data、computed和watch



**initData核心代码是将data数据响应式**

```js
function initData (vm: Component) {
    // 执行数据相应化
    observe(data, true /* asRootData */)
}
```

**core/observer/index.js**

observe方法返回一个Observer实例



**core/observer/index.js**

Observer对象根据数据类型执行对应的相应化操作

defineReactive定义对象属性的getter/setter，getter负责添加依赖，setter负责通知更新



**core/observer/index.js**

Dep负责管理一组Watcher，包括watcher实例的增删及通知更新



**Watcher**

Watcher解析一个表达式并收集依赖，当数值变化时触发回调函数，常用于$watch API和指令中。

每个组件也会有相应的Watcher，数值变化会触发其update函数导致重新渲染

```js
export default class watcher {
    constructor () {}
    get () {}
    addDep (dep: Dep) {}
    update () {}
}
```

#### 数组响应化

​	数组数据变化的侦测跟对象不同，我们操作数组通常使用push、pop、splice等方法，此时没有办法得知数据变化。所以vue中采取的策略是拦截这些方法并通知dep。



**src/core/observer/array.js**

为数组原型中的7个可以改变内容的方法定义拦截器



##### Observer中覆盖数组原型

```js
if (Array.isArray(value)) {
    // 替换数组原型
    protoAugment(value, arrayMethods) // value.__proto__ = arrayMethods
    this.observeArray(value)
}
```

