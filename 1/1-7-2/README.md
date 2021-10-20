#### 复习：

https://www.processon.com/view/link/5e830387e4b0a2d87023890a



### 模板编译：

编译模板的主要目标是**将模板(template)转换为渲染函数(render)**

template => render()



##### 编译模板的必要性：

Vue 2.0 需要利用到VNode描述视图以及各种交互，手写显然不切实际，因此用户只需编写类似HTML代码的Vue模板，通过编译器将模板转换为可返回VNode的render函数。



##### 体验模板编译

带编译器的版本中，可以使用template或者el的方式声明模板，06-1-compiler.html

```js
(function anonymous() {
    with(this) {
        return _c('div', {attrs:{"id": 'demo'}},[_c('h1', [_v('Vue模板编译')]), _v(' '), _c('p', [_v(_s(foo))]), _v(' '), _c('comp')], 1)
    }
})
```

> 输出结果大致如下：
>
> ```js
> (function anonymous() {
>     with(this) {
>         return _c('div', {attrs:{'id': 'demo'}},[
>             _c('h1', [_v('Vue模板编译')]),
>             _v(' '), _c('p', [_v(_s(foo))]),
>             _v(' '), _c('comp')
>         ], 1)
>     }
> })
> ```
>
> 元素节点使用createElement创建，别名_c
>
> 文本节点使用createTextVNode创建，别名_v
>
> 表达式先使用toString格式化，别名_s
>
> 其他渲染helpers: src/core/instance/render-helpers/index.js

#### 整体流程：

##### compileToFunctions

若指定template或者el，则会执行编译，**platforms/web/entry-runtime-with-compiler.js**



##### 编译过程

编译分为三步：解析、优化和生成，**src/compiler/index.js - 真真正正执行编译**

> 1、解析：src\compiler\index.js 里面的parse，把字符串解析为抽象语法树AST。
>
> 2、优化：src\compiler\index.js 里面的optimize，将模板中静态语句进行标记，那么在更新时就可以跳过比对，提升性能。
>
> 3、代码生成：src\compiler\index.js 里面的generate方法，new 一个函数，然后把生成的代码传进去作为参数 => new Function(code)

测试代码：06-1-compiler.html



##### 模板编译过程

实现模板编译共有三个阶段：**解析、优化和生成**

##### 解析 - parse

解析器将模板解析为抽象语法树，基于AST可以做优化或者代码生成工作。

调试查看得到的AST，**/src/compiler/parser/index.js**，结构如下：

![](https://i.loli.net/2021/10/19/DehTauWm2sFNnYd.png)

解析器内部分**HTML解析器、文本解析器和过滤解析器**，最主要是HTML解析器，三个方法都在src/compiler/parse文件夹里面



##### 优化 - optimize

优化器的作用是在AST中找出静态子树并打上标记。静态子树是在AST中永远不变的节点，如纯文本节点。

标记静态子树的好处：

- 每次重新渲染，不需要为静态子树创建新节点
- 虚拟DOM中patch时，可以跳过静态子树

测试代码，06-2-compiler-optimize.html

代码实现，**src/compiler/optimizer.js - optimize**

标记结束：

![](https://i.loli.net/2021/10/19/t8lY9kaGUI5xgr1.png)

> 注：只有静态节点里面嵌套静态节点才会被标记，也就是最少两层静态节点才会被标记为静态节点！因为 Vue 认为只有一层的静态节点被标记然后转化为静态函数这个过程是得不偿失的，所以最少需要静态节点里面再嵌套一层静态节点！

##### 代码生成 - generate

将AST转换成渲染函数中的内容，即代码字符串。

generate方法生成渲染函数代码，**src/compiler/codegen/index.js**

> 生成的code长这样
>
> ```js
> `_c('div',{attrs:{"id:"demo}},[
> 	_c('h1',[_v("Vue.js测试")]),
> 	_c('p',[_v(_s(foo))])
> ])`
> ```

#### 典型指令实现：v-if、v-for

着重观察几个结构性指令的解析过程

> 测试代码：06-2-directive.html



解析v-if：**parser/index.js**

processlf用于处理v-if解析



解析结果：

![](https://i.loli.net/2021/10/20/uAjasvIJ2o18B3W.png)

代码生成，**codegen/index.js**

genlfConditions等用于生成条件语句相关代码

生成结果：

```js
"with(this){return _c('div',{attrs:{"id":"demo"}},[
	(foo) ? _c('h1',[_v(_s(foo))]) : _c('h1', [_v('no title')]),
    _v(' '), _c('abc')
], 1)}"
```

解析v-for：**parser/index.js**

processFor用于处理v-for指令

解析结果：v-for="item in items" for:"items" alias:'item'

![](https://i.loli.net/2021/10/20/eQwgWlFSrPMadTx.png)

> 来看一个经常被问的面试题：v-if 和 v-for 谁的优先级更高？
>
> 答：2.x 版本中在一个元素上同时使用 `v-if` 和 `v-for` 时，`v-for` 会优先作用，3.x 版本中 `v-if` 总是优先于 `v-for` 生效。
>
> v-if的本质就是生成一个三元表达式，源码位置：**src\compiler\codegen\index.js** 175行，生成代码`foo?_c('p',...):_c('')`就是如果成立就生成p标签，如果没有就生成一个空标签，v-for的本质上是生成一个回调函数，然后循环的执行这个回调函数；如果v-if 和 v-for 是写到了同一标签里面那么就意味着每次执行v-for生成的回调函数的时候每次都要做判断（这样就显得它比较弱智了）
>
> 通常 v-if 和 v-for 需要同时使用的时候就以下两种情况：
>
> 1、当 arr 数组里面某一项满足 isShow 的情况下再进行渲染，如：
>
> ```html
> <p v-for="item in arr" :key="item" v-if="item.isShow">{{item}}</p>
> ```
>
> 如果这样写是不是每次都是循环完再进行判断，以为这时dom的操作比较废性能，所以解决方案一般是提前对 arr 使用计算属性做一个过滤，这样过滤出来的数组使用v-for直接全部渲染出来（不用在模板中每次判断了，提高了性能）
>
> 2、先判断然后再决定要不要执行整个循环渲染，这种情况可以在 v-for 的语句外边包上一个 template 标签，然后在标签里面使用 v-if 进行判断，如：
>
> ```html
>     <template v-if="isShow">
>       <p v-for="item in arr" :key="item">{{item}}</p>
>     </template>
> ```
>
> 总结：要么是提前先过滤，要么是把条件提到外边去。官网解释：https://cn.vuejs.org/v2/style-guide/#%E9%81%BF%E5%85%8D-v-if-%E5%92%8C-v-for-%E7%94%A8%E5%9C%A8%E4%B8%80%E8%B5%B7%E5%BF%85%E8%A6%81

代码生成，**src/compiler/codegen/index.js**

genFor用于生成相应代码



生成结果：

```js
"with(this){return _c('div',{attrs:{"id":"app"}},[_m(0),_v(" "),(foo)?_c('p',[_v(_s(foo))]):_e(),_v(" "),
_l((arr), function(item) {return _c('b',{key:s},[_v(_s(s))])})
,_v(" "),_c('comp')],2)}"
```

> 注：v-if，v-for这些指令只能在编译器阶段处理（处理的时刻比较早），所以在 render 函数中使用是不起作用的，如果我们要在render函数处理条件或循环只能使用if和for
>
> ```js
> Vue.component('comp', {
>     props: ['foo'],
>     render(h) {
>       if(this.foo == 'foo') {
> 		return h('div','foo')
>       }
>       return h('div', 'bar')
>     }
> })
> ```

还有一个点就是渲染函数生成的 \_t、\_l、\_v 可能 不太清除是什么东东？见：**src\core\instance\render-helpers\index.js**，但是这个文件里面没有 \_c，那 \_c 在哪里呢？在 **src\core\instance\render.js **里面，其实 \_c 就是createElement这个方法（h函数），无非是 \_c 是供Vue内部使用的

### 组件化机制：

测试代码：06-3-comp.html

```html
// 测试代码中 comp 的创建过程：
    // 创建实例
    // vue根实例
    // App根实例
    // comp组件
```

> 面试题：生命周期，带子组件的那种。
>
> ```js
> // parent create
> // 		parent beforeMount
> //			child create
> //			child beforeMount
> //			child mounted
> // 		parent mounted
> ```
>
> 创建的时候是自上而下的，挂载的时候是自下而上的

#### 组件声明：Vue.component()

initAssetRegister(Vue)   `src/core/global-api/assets.js`

组件注册使用extend()方法将配置转换为构造函数并添加到components选项



#### 组件实例创建及挂载

观察生成的渲染函数

```js
`ƒ anonymous(
) {
with(this){return _c('div',{attrs:{"id":"app"}},[_c('h1',[_v("Vue组件化机制")]),_v(" "),_c('comp')],1)}
}`
```

> _c 就是 createElement

#### 整体流程：

首先创建的事根实例，首次 \_render() 时，会得到整棵树的VNode结构，其中自定义组件相关的主要有：**createComponent() - src/core/vdom/create-component.js**，组件vnode创建



##### createComponent() - src/core/vdom/patch.js

创建组件实例并挂载，vnode转换为dom

整体流程：

new Vue() => $mount() => vm._render() => createElement() => createComponent() => vm.\_update() => patch() => createElm => createComponent()



#### 创建组件VNode

##### _createElement - src/core/vdom/create-element.js

\_createElement 实际执行VNode创建的函数，由于传入tag是非保留标签，因此判定为自定义组件通过createComponent去创建



##### createComponent - src/core/vdom/create-component.js

创建组件VNode，保存了上一步处理得到的组件构造函数，props，事件等