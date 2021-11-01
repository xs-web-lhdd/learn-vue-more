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

```bash
npm i express -S
```

##### 安装nodemon提高开发体验：

```bash
npm i nodemon -g
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
>
> vue 跟 vue-server-renderer 版本匹配

使用 vsr

```js
// 1、创建一个vue实例
const Vue = require('vue')
const app = new Vue({
  template: '<div>hello world</div>'
})

// 2、获取渲染器实例
const { createRenderer } = require('vue-server-renderer')
const renderer = createRenderer()


// 3、用渲染器渲染vue实例
renderer.renderToString(app)
.then(html => {
  // eslint-disable-next-line no-console
  console.log(html)
})
.catch(err => {
  // eslint-disable-next-line no-console
  console.log(err);
})
```

测试代码见：

> 01-express-test.js
>
> 02-vsr-test.js
>
> 03-express-ssr.js



### 知识点

***

#### 理解ssr

#### 传统web开发

传统web开发，网页内容在服务端渲染完成，一次性传输到浏览器。

测试代码： server/01-tradition.js



#### Vue SSR实战

##### 新建工程

vue-cli创建工程即可

```js
vue create ssr
```

> 演示项目使用vue-cli 4.x创建

##### 安装依赖

```js
npm install vue-server-renderer@2.6.10 -S
```

> 确保vue、vue-server-renderer版本一致



#### 启动脚本

创建一个express服务器，将vue ssr集成进来，.server/03-simple-ssr1.js

```js
// 创建一个express实例
const express = require('express')

const app = express()

// 导入vue
const Vue = require('vue')



// 创建渲染器
const { createRenderer } = require('vue-server-renderer')

const renderer = createRenderer()
// 路由：
app.get('/', async (req, res) => {
  // 构建渲染页面的内容
  const vm = new Vue({
    data() {
      return {
        name: '今晚月色真丑！'
      }
    },
    template: '<div>{{name}}</div>'
  })

  try {
    // 渲染出来：得到的是HTML的字符串
    const html = await renderer.renderToString(vm)
    // 发送给前端
    res.send(html)
  } catch (error) {
    res.status(500)
    res.send('服务端错误！请重试！')
  }
})

app.listen('5000')
```

![](https://i.loli.net/2021/11/01/rcBM8fGWgNhjH95.png)

###### 问题：

- 没办法交互
- 路由由express在管理
- 同构开发问题（程序结构跟以前一样）

##### 路由

路由支持仍然使用vue-router

##### 安装

若为引入vue-router则需要安装

```bash
npm i vue-router -S
```

##### 创建路由实例

