#### 复习：

https://www.processon.com/view/link/5da6c108e4b002a6448895c3

#### 学习目标：

- 理解Vue批量异步更新策略
- 掌握虚拟DOM和Diff算法

#### 异步更新队列

Vue高效的秘诀是一套**批量、异步**的更新策略。

##### 概念理解：

![](https://i.loli.net/2021/10/14/OvPqTXUhrKzJGy7.png)

- 事件循环 Event Loop：浏览器为了协调事件处理、脚本执行、网络请求和渲染等任务而制定的工作机制
- 宏任务Task：代表一个个离散的、独立的工作单元。浏览器完成一个宏任务，在下一个宏任务执行开始前，会对页面进行重新渲染。主要包括创建文档对象、解析HTML、执行主线JS代码以及各种事件如页面加载、输入、网络事件和定时器等。
- 微任务：微任务是更小的任务，是在当前宏任务执行结束后立即执行的任务。如果存在微任务，浏览器会清空微任务之后再重新渲染。微任务的例子有 Promise 回调函数、DOM 等。

##### 体验一下：

https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/?utm_source=html5weekly

#### vue中的具体实现：

- 异步：只要侦听到数据变化，Vue将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更。
- 批量：如果同一个watcher被多次触发，只会被推入到队列中一次。去重对于避免不必要的计算和DOM操作时非常重要的。然后，在下一个事件循环"tick"中，Vue刷新队列执行实际工作。
- 异步策略：Vue在内部对异步队列尝试使用原生的`Promise.then`、`MutationObserver`或`setImmediate`，如果执行环境都不支持，则会采用`setTimeOut`代替。

##### update()  core/observer/watcher.js

dep.notify() 之后 watcher 执行更新，执行入队操作



##### queueWatcher(watcher)  core/observer/scheduler.js

执行watcher入队操作



##### nextTick(flushSchedulerQueue)  core/util/next-tick.js

nextTick按照特定异步策略执行队列操作



测试代码：03-timerFunc.html

> 研究：vm.$nextTick(cb)

#### 虚拟DOM：

##### 概念：

虚拟 DOM 是对DOM的JS抽象表示，它们是**JS对象**，能够描述DOM结构和关系。应用的各种状态变化会用于虚拟DOM，最终映射到DOM上。

![](https://i.loli.net/2021/10/16/bBVEJUmtZdT2egp.png)

#### 体验虚拟DOM：

vue中虚拟dom基于snabbdom实现，安装snabbdom并体验

#### 优点：

- 虚拟DOM轻量、快速：当它们发生变化时通过新旧虚拟DOM比对可以得到最小DOM操作量，配合异步更新策略减少刷新频率，从而提升性能

  ```js
  patch(vnode, h('div', obj.foo))
  ```

- 跨平台：将虚拟dom更新转换为不同运行时特殊操作实现跨平台

  ```html
  <script>
      // 增加style模块
      const patch = init([snabbdom_style.default])
      
      function render() {
          // 添加节点样式描述
          return h('div', { style: { color: 'red' } }, obj.foo)
      }
  </script>
  ```

- 兼容性：还可以加入兼容性代码增强操作的兼容性

#### 必要性：

vue1.0中有细粒度的数据变化侦测，它是不需要虚拟DOM的，但是细粒度造成了大量开销，这对于大型项目来说是不可接受的。因此，vue2.0选择了中等粒度的解决方案，每一个组件一个watcher实例，这样状态变化时只能通知到组件，再通过引入虚拟DOM去进行比对和渲染。

#### 整体流程：

##### mountComponent()  core/instance/lifecycle.js

渲染、更新组件

```js
// 定义更新函数
const updateComponent = () => {
    // 实际调用是在 lifecycleMinix 中定义的 _update 和 renderMixin 中定义的 _render
    vm._update(vm._render(), hydrating)
}
```

##### _render  cpre/instance/render.js

生成虚拟dom



##### _update  core/instance/render.js

update负责更新dom，转换为vnode为dom



##### \__patch__()  platforms/web/runtime/index.js

\__patch__是在平台特有代码中指定的

```js
Vue.prototype.__patch__ = inBrowser ? patch : noop
```



测试代码： example/test/04-vdom.html



#### patch获取

patch是createPatchFunction的返回值，传递nodeOps和modules是web平台特别实现

> nodeOps：是web平台对节点的所有操作：创建、插入、删除节点等。
>
> modules：是对所有特性的操作。

```js
export const patch: Function = createPatchFunction({ nodeOps, modules })
```



##### platforms/web/runtime/node-ops.js

定义各种原生dom基础操作方法



##### platforms/web/runtime/modules/index.js

`modules`定义了属性更新实现



watcher.run() => componentUpdate() => render() => update() => patch()



#### patch实现

##### patch  core/vdom/patch.js

首先进行树级别比较，可能有三种情况：增删改

- new VNode 不存在就删
- old VNode 不存在就增
- 都存在就执行diff执行更新

![](https://i.loli.net/2021/10/16/2SsDa15MKqrB3zh.png)

进行同层比较（为了降低时间复杂度）

##### patchVnode

比较两个VNode，包括三种类型操作：**属性更新、文本更新、子节点更新**

具体规则如下：

​	1、新老节点**均有children**子节点，则对子节点进行diff操作，调用**updateChildren**

​	2、如果**新节点有子节点而老节点没有子节点**，先清空老节点的文本内容，然后为其新增子节点。

​	3、当**新节点没有子节点而老节点有子节点**的时候，则移除该节点的所有子节点。

​	4、当**新老节点都无子节点**的时候，只是文本的替换。

测试，04-vdom.html

```js
// patchVnode过程分解
// 1.div#demo	updateChildren
// 2.h1			updateChildren
// 3.text		文本相同跳过
// 4.p			updateChildren
// 5.text		setTextContent
```



##### updateChildren：

updateChildren主要作用是一种较高效的方式比对新旧两个VNode的children得出最小操作补丁。执行一个双循环是传统方式（时间复杂度太高），vue中针对web场景特点做了特别的算法优化，我们看图说话：

![](https://i.loli.net/2021/10/16/7aI3cbDxKBkWg19.png)

在新老两组VNode节点的左右头尾两侧都有一个变量标记，在**遍历过程中这几个变量都会向中间靠拢**。当**oldStartIdx > oldEndIdx**或者**newStartIdx > newEndIdx**时结束循环。

下面是遍历规则：

​	首先，oldStartVnode、oldEndVnode与newStartVnode、newEndVnode**两两交叉比较，共有4种比较方法。**当oldStartVnode和newStartVnode或者oldEndVnode和newEndVnode满足sameVnode，直接将该VNode节点进行patchVnode即可，不需要再遍历就完成了一次循环。如下图：

![](https://i.loli.net/2021/10/16/YlUMFNHTuBRGZ64.png)

如果oldStartVnode与newEndVnode满足sameVnode。说明oldStartVnode已经跑到了oldEndVnode后面去了，进行patchVnode的同时还需要将真实DOM节点移动到oldEndVnode后面。

![](https://i.loli.net/2021/10/16/kJoVOcbF7XHw2pZ.png)

如果oldEndVnode与newStartVnode满足sameVnode，说明oldEndVnode跑到了oldStartVnode的前面，进行patchVnode的同时要将oldEndVnode对应DOM移动到oldStartVnode对应的DOM的前面。

![](https://i.loli.net/2021/10/16/TY59me17baEWgdz.png)

如果以上情况均不符合，则在oldVNode中找于newStartVnode相同的节点，若存在执行patchVnode，同时将elmToMove移动到oldStartIdx对应的DOM的前面。

![](https://i.loli.net/2021/10/16/exKmz1v3FwY7sCf.png)

当然也有可能newStartVnode在oldVNode节点中找不到一致的sameVnode，这个时候会调用createElm创建一个新的DOM节点。



![](https://i.loli.net/2021/10/16/eVkHyKidELU3NRv.png)

至此循环结束，但是我们还需要处理剩下的节点。

当结束时oldStartIdx > oldEndIdx，这个时候旧的VNode节点已经遍历完了，但是新的节点还没有。说明了新的VNode节点实际上比老的VNode节点多，需要将剩下的VNode对应的DOM插到真实DOM中，此时调用addVnodes（批量调用createElm接口）。

![](https://i.loli.net/2021/10/16/AFUDnNYaQiXkmjE.png)

但是，当结束时newStartIdx > newEndIdx时，说明新的VNode节点已经遍历完了，但是老的节点还有剩余，需要从文档中删除节点。

![](https://i.loli.net/2021/10/16/1bZCdYvsJg6noEH.png)

> 测试用例：04-vdom2.html

##### 论循环中key的重要性：

```js
  <script>
    // 创建实例
    const app = new Vue({
      el: '#demo',
      data: {
        arr: ['a', 'b', 'c', 'd']
      },
      mounted() {
        setTimeout(() => {
          this.arr.splice(2, 0, 'e')
        }, 1000)
      }
    })
  </script>
```

```js
      // 有 key 的更新过程：

      // a b c d
      // a b e c d

      // b c d
      // b e c d

      // c d
      // e c d

      // c
      // e c

      // null
      // e  
      // 创建一次插入就行


      // 不使用key：undefined === undefined
      // 如果不设置key，那么key就相当于是undefined，那么两个undefined就是true，那么无论两个节点是否是同一个节点都会被vue判别为两个相同节点

      // a b c d
      // a b e c d

      // b c d
      // b e c d

      // c d
      // e c d
      // 执行一次更新：因为没有设置key，会导致vue把e中的东西全部强行更新到c中，这样就会造成性能损耗（做了大量的dom操作）

      // d
      // c d
      // 又执行一次更新：因为没有设置key，会导致vue把c中的东西全部强行更新到d中，这样就会造成性能损耗（做了大量的dom操作）

      // null
      // d 插入
      // 创建一次，更新两次

      // 这个没有key的和有key的一对比就会发现vue中多做了两次更新 --- 如果列表更长那么这样做就是毁灭性的打击
```

通过上面过程的捋顺也就明白了不设置key的弊端和vue中为什么不建议用index做key

##### 思考？：

- 节点属性是如何更新的
- key 是怎么起作用的

