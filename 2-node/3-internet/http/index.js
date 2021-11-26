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