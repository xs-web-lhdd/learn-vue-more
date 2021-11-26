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