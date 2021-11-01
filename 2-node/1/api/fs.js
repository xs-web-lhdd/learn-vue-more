// const fs = require('fs')
// const { promisify } = require('util')
// const readFile = promisify(fs.readFile)


(async () => {
  const fs = require('fs')
  const { promisify } = require('util')
  const readFile = promisify(fs.readFile)
  const data = await readFile('./config.js')
  console.log(data.toString());
})()

// // 同步读取：
// const data = fs.readFileSync('./config.js')
// // 得到的是 buffer 对象
// // 转化为字符串才能得出字符串
// console.log(data.toString());


// // 异步读取: 以错误为优先的回调
// fs.readFile('./config.js', (err, data) => {
//   if (err) throw err
//   console.log('data', data.toString());
// })