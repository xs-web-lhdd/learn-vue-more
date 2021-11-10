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

- 异步中间件：上面的函数是同步的，挨个遍历即可，如果是异步的函数呢，是一个promise，我们要支持 async+await 中间件，所以我们要等异步结束后，在执行下一个中间件。

```js
function compose (middlewares) {
  return function () {
    return dispatch(0)
    function dispatch(i) {
      let fn = middlewares[i]
      if (!fn) {
        // 空的
        return Promise.resolve()
      }
      return Promise.resolve(
        fn(
          function next() {
            return dispatch(i + 1)
          }
        )
      )
    }
  }
}

async function fn1 (next) {
  console.log('fn1开始了');
  await next()
  console.log('fn1结束了');
}


async function fn2 (next) {
  console.log('fn2开始了');
  await delay()
  await next()
  console.log('fn2结束了');
}

function fn3 (next) {
  console.log('fn3');
}

function delay () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 2000)
  })
}

const middlewares = [fn1, fn2, fn3]
const finalFn = compose(middlewares)
finalFn()
```

- compose 用在 koa 中，Loa.js

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
  constructor() {
    this.middlewares = []
  }
  listen(...args) {
    // 创建 http 服务
    const server = http.createServer((req, res) => {
      // 创建上下文
      let ctx = this.createContext(req, res)

      // 合成
      const fn = this.compose(this.middlewares)
      fn(ctx)
      // this.callback(ctx)
      // this.callback(req, res)

      // 数据响应
      res.end(ctx.body)
    })
    // 启动监听
    server.listen(...args)
  }

  // 不止输入一个 callback 函数
  // use(callback) {
  //   this.callback = callback
  // }
  use(middlewares) {
    this.middlewares.push(middlewares)
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

  /**
   * 合成函数
   * @param {*} middlewares 
   * @returns 
   */
  compose (middlewares) {
    return function (ctx) {
      return dispatch(0)
      function dispatch(i) {
        let fn = middlewares[i]
        if (!fn) {
          // 空的
          return Promise.resolve()
        }
        return Promise.resolve(
          fn(
            ctx, function next() {
              return dispatch(i + 1)
            }
          )
        )
      }
    }
  }
}

module.exports = Loa
```

> koa-compose 的源码
>
> - 兼顾 OOP 和 AOP
> - 函数编程 函数即逻辑（React 函数即组件 组件即页面）

- 看一下 Express

### 看一下koa中间件的实现

- koa中间件的规范：

  - 一个 async 函数
  - 接收 ctx 和 next 两个参数
  - 任务结束需要执行 next

  ```js
  const mid = async (ctx, next) => {
      // 来到中间件，洋葱圈左边
      next() // 进入其他中间件
      // 再次来到中间件，洋葱圈右边
  }
  ```

- 中间件常见任务：

  - 请求拦截
  - 路由
  - 日志
  - 静态文件服务

- 路由 router

  将来可能的用法

```js
const koa = require('./kkb')
const Router = require('./router')
const app = new Koa()
const router = new Router()

router.get('/index', async ctx => { ctx.body = 'index page' })
router.get('/post', async ctx => { ctx.body = 'post page' })
router.get('/list', async ctx => { ctx.body = 'list page' })
router.get('/index', async ctx => { ctx.body = 'post page' })

// 路由实例输出父中间件 router.routes()
app.use(router.routes())
```

routes() 的返回值是一个中间件，由于需要用到method，所以需要挂载method到ctx之上，修改request.js
![](https://i.loli.net/2021/11/10/bh7tQSIF6BfxUGj.png)



- 静态文件服务 koa-static
  - 配置绝对资源目录地址，默认为 static
  - 获取文件或目录信息
  - 静态文件读取
  - 返回

```js
// static.js
const fs = require('fs')
const path = require('path')

module.exports = (dirPath = './public') => {
    return async (ctx, next) => {
        if (ctx.url.indexOf('./public') === 0) {
            // public 开头，读取文件
            const url = path.resolve(__dirname, dirname)
            const fileBaseName = path.basename(url)
            const filepath = url + ctx.url.replace('./public', "")
            console.log(filepath)
        }
        try {
            
        }
    }
}
```

```js
// 使用
const static = require('./static')
app.use(static(__dirname + '/public'))
```

- 请求拦截：黑名单中存在的 IP 访问将被拒绝

```js
module.exports = async function(ctx, next) {
    const { res, req } = ctx
    const blackList = ['127.0.0.1']
    const ip = getClientIP(req)
    
    if (blackList.include(ip)) {
        ctx.body = 'not allowed'
    } else {
        await next()
    }
}
function getClientIP(req) {
    return (
        req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        req.connection.remoteAddress || // 判断 connection 的远程 IP
        req.socket.remoteAddress || // 判读后端的 socket 的 IP
        req.connection.socket.remoteAddress
    )
}

// app.js
app.use(require('./interceptor'))
app.listen(3000, '0.0.0.0', () => {
    console.log('监听端口3000')
})
```

> 请求拦截应用非常广泛：登录状态验证、CORS头设置

扩展内容：

Object.create的理解

https://juejin.im/post/5dd20cb3f265da0bf66b6670

中间件扩展学习

https://juejin.im/post/5dbf9bdaf265da4d25054f91

策略模式

https://github.com/su37josephxia/frontend-basic/tree/master/src/strategy

中间件对比

https://github.com/nanjixiong218/analys-middlewares/tree/master/src

责任链模式

https://blog.csdn.net/liuwenzhe2008/article/details/70199520

### 思维导图：

https://www.processon.com/view/link/5d4b852ee4b07c4cf3069fec#map

