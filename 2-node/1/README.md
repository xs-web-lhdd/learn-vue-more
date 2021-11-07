## Node.js基础

### 重点总结

***

- 异步I/O概念、promisify用法、流、buffer
- 一个简单http服务（页面、json数据、静态资源）
- 实战一个cli工具（vue路由约定）

### I/O处理

#### 异步非阻塞I/O

##### 响水壶

同步读取：fs.readFileSync

```js
// 同步读取：
const data = fs.readFileSync('./config.js')
// 得到的是 buffer 对象
// 转化为字符串才能得出字符串
console.log(data.toString());
```

异步读取：fs.readFile

```js
// 异步读取: 以错误为优先的回调
fs.readFile('./config.js', (err, data) => {
  if (err) throw err
  console.log('data', data.toString());
})
```

上面异步读取采用回调的方式，如果回调过多就会产生回调地狱，可以采用promisify：

```js
(async () => {
  const fs = require('fs')
  const { promisify } = require('util')
  const readFile = promisify(fs.readFile)
  const data = await readFile('./config.js')
  console.log(data.toString());
})()
```

#### Buffer缓冲区
> 读取数据类型为 Buffer
- Buffer - 用于在 TCP 流、文件系统操作、以及其他上下文中与八字节流进行交互。八位字节组成的数组，可以有效的在JS中存储二进制数据
```js
// 创建一个长度为10字节以0填充的Buffer
const buf1 = Buffer.alloc(10)
console.log('buf1===>', buf1);
// buf1===> <Buffer 00 00 00 00 00 00 00 00 00 00> 十个字节的位置

const buf2 = Buffer.from('a')
console.log('buf2===>', buf2);
// buf2===> <Buffer 61> a 阿斯克码的值是 61

// 创建Buffer包含UTF-8字节
// UTF-8：一种变长的编码方案，使用 1-6 个字节来存储
// UTF-32：一种固定长度的编码方案，不管字符编号大小，始终使用 4 个字节来存储
// UTF-16：介于 UTF-8 和 UTF-32 之间，使用 2 个或者 4 个子节来存储，长度既固定又可变
const buf3 = Buffer.from('中文')
console.log('buf3===>', buf3);
// buf3===> <Buffer e4 b8 ad e6 96 87> 一个中文一般占两到三个字节

// 写入Buffer数据
buf1.write('hello')
console.log(buf1)

// 读取Buffer数据
console.log(buf3.toString())

// 合并Buffer
const buf4 = Buffer.concat([buf2, buf3])
console.log('buf4===>', buf4);
```

> Buffer类似数组，所以很多方法它都有
>
> CBK 转码 iconv-lite

#### http服务

创建一个http服务，05-http.js

```js
const http = require('http')
const server = http.createServer((request, response) => {
  console.log('there is a request');
  response.end('a response from server')
})

server.listen(3000)
```

写一个简单的：

```js
const http = require('http')
const fs = require('fs')
const server = http.createServer((request, response) => {
  console.log('there is a request');
  // response.end('a response from server')
  const { url, method } = request
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

```

#### Stream 流

stream - 是用于与node中流数据交互的接口

```js
// 二进制友好，图片操作，06-stream.js
const fs = require('fs')
const rs2 = fs.createReadStream('./01.jpg')
const ws2= fs.createReadStream('./02.jpg')   
rs2.pipe(ws2)

// 相应图片请求， 05-http.js
const { url, method, headers } = request

else if (method === 'GET' && heraders.accept.indexOf('image/*') !== -1) {
    fs.createReadStream('.'+url).pipe(response)
}
```

> Accept代表发送端（客户端）希望接受的数据类型。比如：Accept：text/xml；代表客户端希望接收的数据类型是xml类型。
>
> Content-Type代表发送端（客户端|服务器）发送的实体数据类型。比如：Content-Type：text/html;代表发送端发送的数据格式是html。
>
> 二者结合起来，Accept：text/xml；Content-Type：text/html，即代表希望接收的数据类型是xml格式，本次请求发送的数据的数据格式是html。

#### CLI 工具

##### 创建工程

```js
```

