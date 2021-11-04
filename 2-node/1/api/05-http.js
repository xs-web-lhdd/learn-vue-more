const http = require('http')
const fs = require('fs')
const server = http.createServer((request, response) => {
  console.log('there is a request');
  // response.end('a response from server')
  const { url, method } = request
  // 首页：
  if (url === '/' && method === 'GET') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        response.writeHead(500, {
          'Content-Type': 'text/plain;charset=utf-8'
        })
        response.end('500 报错')
        return
      }
      response.statusCode = 200
      response.setHeader('Content-Type', 'text/html;charset=utf-8')
      response.end(data)
    })
  } else if (url === '/users' && method === 'GET') {
    response.end('this is a page of users')
  } else {
    response.statusCode = 404
    response.setHeader('Content-Type', 'text/plain;charset=utf-8')
    response.end('找不到去火星了')
  }
})


// 打印原型链
function getPrototypeChain(obj) {
  const protoChain = []
  while (obj = Object.getPrototypeOf(obj)) {
    protoChain.push(obj)
  }
  return protoChain
}

server.listen(3000)
