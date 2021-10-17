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

编译分为三步：解析、优化和生成，**src/compiler/index.js**

测试代码：06-1-compiler.html



##### 模板编译过程

实现模板编译共有三个阶段：**解析、优化和生成**

##### 解析 - parse

解析器将模板解析为抽象语法树，基于AST可以做优化或者代码生成工作。

调试查看得到的AST，**/src/compiler/parser/index.js**，结构如下：

解析器内部分**HTML解析器、文本解析器和过滤解析器**，最主要是HTML解析器



##### 优化 - optimize

优化器的作用是在AST中找出静态子树并打上标记。静态子树是在AST中永远不变的节点，如纯文本节点。



标记静态子树的好处：

- 每次重新渲染，不需要为静态子树创建新节点
- 虚拟DOM中patch时，可以跳过静态子树

测试代码，06-2-compiler-optimize.html

代码实现，**src/compiler/optimizer.js - optimize**

标记结束