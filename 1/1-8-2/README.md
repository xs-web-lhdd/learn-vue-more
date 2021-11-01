### SSR：

#### 资源：

https://ssr.vuejs.org/

#### 概念：

服务端渲染：将vue实例渲染为HTML字符串直接返回，在前端激活为交互程序



#### 优点：

- 更好的 SEO
- 首屏内容到达时间



#### 服务端知识：

##### express

```js
npm i express -S
```



基础 http 服务

```js
// nodejs 代码
const express = require('express')

// 获取express实例
const server = express()

// 编写路由处理不同url请求
server.get('/', (req, res) => {
    res.send('<strong>hello world</strong>')
})

// 监听端口
server.listen(80, () => {
    console.log('server running!')
})
```



#### 基础实现：

使用渲染器将vue实例成HTML字符串并返回

安装 vue-server-renderer

```js
npm i vue vue-server-renderer -S
```

> 确保版本相同且匹配

使用 vsr

```js
// 1、创建vue实例
```

