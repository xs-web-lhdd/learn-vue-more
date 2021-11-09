const koa = require('koa')
const app = new koa()
// app.use((ctx, next) => {
//   ctx.body = [
//     {
//       name: 'tom'
//     }
//   ]
// })

app.use((ctx, next) => {
  // 同步 sleep
  const expire = Date.now() + 100
  while (Date.now() < expire)
  ctx.body = {
    time: Date.now() - expire
  }
  console.log('url' + ctx.url)
})

app.listen(3000)