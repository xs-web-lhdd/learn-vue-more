const Loa = require('./Loa.js')
const app = new Loa()

// app.use((req, res) => {
//   res.writeHead(200)
//   res.end('hi liu')
// })

app.use(ctx => {
  ctx.body = 'ha ha ha'
}, ctx => {
  console.log(111);
})

app.listen(3000, () => {
  console.log('监听端口已启动！');
})