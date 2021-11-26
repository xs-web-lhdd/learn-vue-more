# 网络编程：

- ### 掌握HTTP协议

- 掌握跨域CORS

- 掌握bodyparser原理

- 掌握上传原理

- 了解socketio实现实时聊天程序

- 爬虫

### 网络编程 http https http2 websocket

玩一下：建立一个简单的聊天框：

```js
const net = require('net')
const chatServer = net.createServer()
const clientList = []
chatServer.on('connection', client => {
  client.write('Hi!\n')
  clientList.push(client)
  client.on('data', data => {
    console.log('recv:', data.toString());
    clientList.forEach((item) => {
      item.write(data)
    })
  })
})

chatServer.listen(9000)
```

然后启动一个cmd窗口输入 `telnet localhost 9000`

> 注：电脑需要开启telnet https://blog.csdn.net/weixin_43318134/article/details/104102925

### 知识点

### HTTP协议

```bash
// 观察 HTTP 协议
curl -v https://www.baidu.com/
```

- http 协议详解
- 创建接口，api.js

```js
// http/api.js
const http = require('http')
const fs = require('fs')

const app = http.createServer((req, res) => {
  const { url, method } = req
  if (method === 'GET' && url === '/') {
    res.end('index page')
  } else if (method === 'GET' && url === '/user') {
    res.end('user page')
  }
})

app.listen(3000)
```

- 请求接口

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  <script src="http://localhost:3000/user">
    (async () => {
      const res = await axios.get('http://localhost:3000/user')
      console.log('data=>>>', res.data);
    })()
  </script>
</body>
</html>
```



协议 端口 host

- 跨域：浏览器同源策略引起的接口调用问题

- 常用解决方案：

  1、JSONP（JSON with Padding），前端+后端方案，绕过跨域

> 前端构造script标签请求指定URL（由script标签发出的GET请求不受同源策略限制），服务器返回一个函数执行语句，该函数名称通常由查询参callback的值决定，函数的参数为服务器返回的json数据，该函数在前端执行后即可获取数据。

​		2、代理服务器

> 请求同源服务器，通过该服务器转发请求至目标服务器，得到结果再转发给前端。
>
> 前端开发中测试服务器的代理功能就是采用的该解决方案，但是最终发布上线时如果web应用和接口服务器不在一起仍会跨域。

​		3、CORS（Cross Origin Resource Share）- 跨域资源共享，后端方案，解决跨域

预检请求

```bash
原理： cors 是 w3c 规范，真正意义上解决跨域问题。它需要服务器对请求进行检查并对响应头做响应处理，从而允许跨域请求。
```

具体实现：

- 响应简单请求：动词为 get/post/head，没有自定义请求头，Content-Type 是 application/x-www-form-urlencoded，multipart/form-data 或者 text/plain 之一，通过添加以下响应头解决：

```js
res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
```

