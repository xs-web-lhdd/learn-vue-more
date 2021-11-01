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



