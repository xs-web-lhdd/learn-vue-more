# vue2

## 较为核心的知识点总结：
### 组件化：
vue 组件系统提供了一种抽象，让我们可以使用独立可复用的组件来构建大型应用，任意类型的应用界面都可以抽象为一个组件树。组件化能**提高开发效率，简化调试步骤，提升项目可维护性，便于多人协作开发**

#### 组件间通信常用方式：
- props
- event
- vuex

自定义事件：
- 边界情况
  - $parent
  - children
  - root
  - refs
  - provide/inject
- 非 prop 特性
  - $attrs
  - $listeners

##### props:
父组件给子组件传值：
```js
// child 
props: { msg: String }

// parent
<HelloWorld msg="Hello Vue.js" />
```

自定义事件：
子给父传值
```js
// child
this.$emit('add', message)

// parent
<Cart @add="cartAdd($event)"></Cart>
```

##### 事件总线：
任意两个组件之间传值常用事件总线 或 vueX 的方式
```js
// main.js
Vue.prototype.$bus = new Vue()
// child2 利用事件总线发送事件
this.$bus.$emit('event-from-child2', '这是来自 Child2 的信息')
// child1 利用事件总线接收事件
this.$bus.$on('event-from-child2', msg => {
  console.log('Child1:', msg); // Child1: 这是来自 child2 的信息
});
```
内部原理：
```JS
// Bus: 事件派发、监听和回调管理
class Bus {
  constructor() {
    this.callbacks = {}
  }
  $on(name, fn) {
    this.callbacks[name] = this.callbacks[name] || []
    this.callback[name].push(fn)
  }
  $emit(name, args) {
    if (this.callbacks[name]) {
      this.callbacks[name].forEach(cb => cb(args))
    }
  }
}
```
这一般不需要我们在项目中写，因为 $emit/$on 在 vue 中有被封装好的

vueX:
创建唯一的全局数据管理者 store，通过它管理数据并通知组件状态变更


##### $parent/$root:
兄弟组件之间通信可通过共同祖辈搭桥，$parent 或 $root
```js
// brother1
this.$parent.$on('foo', handle)
// brother2
this.$parent.$emit('foo')
```
这种写法可以直接进行兄弟组件的通信


##### $children:
父组件可以通过 $children 访问子组件实现父子通信

```js
// parent
this.$children[0].xx = 'xxx'
```
这样父组件就可以通过 this.$children[x] 拿到子组件，然后调用子组件上面的方法 如：
```js
this.$children[1].sendToChild1();
```
上面同样的想法也可以在自定义组件上面添加 ref 以达到相同的效果：
```js
// 在组件上添加 ref="child2"
this.$refs.child2.sendToChild1(); // 与 this.$children[1].sendToChild1(); 效果相同
```

! 注意：$children 不能保证子元素顺序
举例1：
```js
// 第一个是同步组件：
<Child1 />
// 第二个是同步组件：
<Child2 />
// 这样 this.$children[0] 就是 <Child1 /> 组件

// 但如果是这样：
// 第一个是异步组件：
<Child1 />
// 第二个是同步组件：
<Child2 />
// 这样 this.$children[0] 就是 <Child2 /> 组件
```
###### ？this.$children 与 this.refs 有什么区别呢？
this.$children 只有自定义组件，但是 this.$refs 既可以有自定义组件也可以有普通的 DOM 元素


##### $attrs/$listeners:
包含了父组件域种不作为 prop 被识别（且获取）的特性绑定（class和style除外）。当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定（class和style除外），并且可以通过**v-bind="$attrs" 传入内部组件----在创建高级别的组件时非常有用。**
```js
// child: 并未在 props 中声明 foo
<p>{{$attrs.foo}}</p>

// parent
<HelloWorld foo="foo" />
```
注意：一般 $attrs 用于父组件传递 props 而子组件不接受 props 时，可以通过 this.$attrs.xx 获取，这种用法是比较常见的情况，还有一个场景就是爷爷组件给孙子组件传值时（三层），大家可能是通过爷爷组件通过 props 这种方法给父组件传值，然后父亲组件也通过 props 这种方式给孙子组件传值，但是如果要传递的东西很多，那是不是书写的时候就太麻烦了，于是乎可以利用 $attrs,用法：在父组件里面添加 `v-bind="$attrs"` 然后在子组件里面就可以通过 `$attrs.xx` 的方式拿到各种属性值，同理事件也可以这样搞，只需在父组件中写入 `v-on="$listeners"` 然后子组件就可以通过 `this.$emit('foo')` 向爷爷组件派发事件

##### provide/inject:
适用场景：跨很多层进行传参（上面 $attrs 适用于3层，而这个可以适用于很多层）
基本用法：
```js
// 祖先组件：
provide() {
  return {
    bar: 'bar'
  }
},

// 后代组件：
inject: ['bar']
```
在这里可能会有一个问题就是 inject 跟 data 或者 props 里面的东西起冲突了怎么办？
解决方法是可以起别名
```js
// 起别名：
inject: {
  bar1: 'bar'
},

// 设置默认值：
inject: {
  bar1: {
    from: 'bar',
    default: 'barrrrrrrr'
  }
},
```



#### 插槽：

## 组件化实战：
#### 通用表单组件
收集数据、校验数据并提交
### 需求分析
- 实现KForm
  - 指定数据、校验规则
- KformItem
  - label标签添加
  - 执行校验
  - 显示错误信息
- KInput
  - 维护数据
### input 组件完毕：
见 form-practice
### 问题：
- 1、$parent 牵连性太强，应进行解耦，如果在模板中 KInput 父组件不是 KFormInput 那么该功能就会失效
- 2、在 KForm 进行全局校验的时候使用的是 $children，不严谨，一旦有异步组件就会出 bug
- 3、使用 Vue.extend 方式实现 create 方法

#### $parent解决方案：
从 element 源码中找到解决方案：https://github.com/ElemeFE/element/blob/dev/src/mixins/emitter.js

在 KInput.vue 里面改进：
```js
this.dispatch('KFormItem', 'validate')
```
由于 dispatch 里面需要 componentName ，因此需要在 KFormItem 里面添加：
```js
componentName: 'KFormItem',
```

##### 步骤：
- 1、mixin emitter
- 2、声明 componentName
- 3、在需要的地方 dispatch()

#### $children解决方案：
在 KFormItem 组件挂载完成后使用 dispatch 触发 form.addField 事件，并将自己作为参数传递过去，然后 KForm 在 created 中监听 fomr.addField 事件，在回调函数中将子组件传递过来的 this 放入 field 数组中，然后 KForm 进行全局校验的时候可以循环 field ，然后逐个调用他们的 validate 方法进行自我校验

KFormItem中改进：
```js
// 派发事件通知 KForm，新增一个 KFormItem 实例
if(this.prop) {
  this.dispatch('KForm', 'form.addField', [this])
}
```

KForm中改进：
```js
componentName: 'KForm',

created() {
  // 源码的 fields 在 data 中是响应式的，这里咱没有改进为响应式
  this.fields = []
  this.$on('form.addField', item => {
    this.fields.push(item)
  })
},

validate() {
  // 2、较为严谨的写法：
  const tasks = this.fields.map(item => item.validate())
}
```

#### 使用Vue.extend方式实现create方法：
- Vue.extend
```js
const Ctor = Vue.extend(Component)
// 创建组件实例：
const comp = new Ctor({propsData: props})
comp.$mount()
document.body.appendChild(comp.$el)
comp.remove = () => {
  document.body.removeChild(comp.$el)
  comp.$destroy()
}
```
输出 comp.$el 是一个注释，这是因为组件里面的 v-if 导致的，在 patch 的 diff 算法里面也是一样的，当后面执行 show() 时就会变成 div 

