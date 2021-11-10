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