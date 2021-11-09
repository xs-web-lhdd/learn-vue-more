# Koa2源码解析：

### 课前准备：

koa：

### 回顾：

基于 koa 打造企业级 MVC 框架

### 课堂目标：

1、手写koa

2、手写static中间件

### 课堂主题：

1、koa 原理

2、context

3、Application 剖析

4、中间件机制

5、常用中间件



### 知识点：

#### koa

- 概述：Koa 是一个新的 **web框架**，致力于成为 **web应用**和 **API 开发**领域中的一个更小、更富有表现力、更健壮的基石头。

koa 是 Wxpress 的下一代基于 Node.js 的web框架

koa2 完全使用 Promise 并配合 `async`来实现异步

- 特点：
  - 轻量，无捆绑
  - 中间件架构
  - 优雅的API设计
  - 增强的错误处理
- 安装：`npm i koa -S`
- 中间件机制、请求、响应处理

### context

- koa 为了能够简化API，引入上下文context概念，将原始请求对象req和响应式对象res封装并挂载到context上，并且在context上设置getter和setter，从而简化操作。

使用方法，接近koa了

```js
// app.js
app.use(ctx => {
    ctx.body = 'hehe'
})
```

![](https://i.loli.net/2021/11/09/mlBUprs2oMtWE1k.png)

- 知识存储：getter/setter方法

```js
// 测试代码 test-getter-setter.js
const L = {
  info: {name: '凉风有信、'},
  get name() {
    return this.info.name
  },
  set name(val) {
    this.info.name = val
  }
}

// 简化（代理）：
// L.info.name => L.name
console.log(L.name);
L.name = 'Miss L'
console.log(L.name);
```

- 封装request、response和context

request：https://github.com/koajs/koa/blob/master/lib/response.js
response：https://github.com/koajs/koa/blob/master/lib/request.js

context：https://github.com/koajs/koa/blob/master/lib/context.js

`request.js`

```js
module.exports = {
  get url() {
    return this.req.url
  },
  
  get method() {
    return this.req.method.toLowerCase()
  }
}
```

`response`

```js
module.exports = {
  get body() {
    return this._body
  },

  set body(val) {
    this._body = val
  }
}
```

`context`

```js
module.exports = {
  get url() {
    return this.request.url
  },
  get body() {
    return this.response.body
  },
  set body(val) {
    this.response.body = val
  },
  get method() {
    return this.request.method
  }
}

```

`Loa`

```js
/**
 * @description 手写koa
 * @author 凉风有信、
 */

const http = require('http')
const context = require('./context')
const request = require('./request')
const response = require('./response')

class Loa {
  listen(...args) {
    // 创建 http 服务
    const server = http.createServer((req, res) => {
      // 创建上下文
      let ctx = this.createContext(req, res)

      this.callback(ctx)
      // this.callback(req, res)

      // 数据响应
      res.end(ctx.body)
    })
    // 启动监听
    server.listen(...args)
  }
  use(callback) {
    this.callback = callback
  }

  /**
   * 创建上下文
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  createContext(req, res) {
    // Object.create代表继承
    const ctx = Object.create(context)
    ctx.request = Object.create(request)
    ctx.response = Object.create(response)

    ctx.req = ctx.request.req = req
    ctx.res = ctx.response.res = res

    return ctx
  }
}

module.exports = Loa
```

Object.create()：https://www.jianshu.com/p/28d85bebe599



### 中间件

- Koa中间件机制：Koa中间件机制就是函数式，组合概念 Compose 的概念，将一组需要顺序执行的函数复合为一个函数，外层函数得参数实际是内层函数得返回值。洋葱圈模型可以形象表示这种机制，是源码中的精髓和难点。

![](https://i.loli.net/2021/11/09/xodUm52kp6bCOTr.png)

- 知识储备：函数组合

```js
const add = (x, y) => x + y
const square = z => z * z

const fn = (x, y) => square(add(x, y))
console.log(fn(1, 2));
```

上面就算是两次函数组合调用，我们可以把他合并成一个函数

```js
const fn = (x, y) => square(add(x, y))
const fn = compose(add, square, square)
```

多个函数组合：中间件的数目是不固定的，我们可以用数组来模拟

```js
const compose = (...[first, ...other]) => {
  return (...args) => {
    let ret = first(...args)
    other.forEach(fn => ret = fn(ret))
    return ret
  }
}

const fn = compose(add, square, square)
console.log(fn(1, 2));
```

