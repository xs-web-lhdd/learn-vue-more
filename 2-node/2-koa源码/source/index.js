const http = require('http')
const server = http.createServer((req, res) => {
  res.end('13')
})

server.listen(3000)