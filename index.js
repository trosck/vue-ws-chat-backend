import WebSocket, { WebSocketServer } from 'ws'
import { ListManager } from './core/redis.js'
import { KurdishNicknames } from 'kurdish-nicknames'
import { sentence } from 'txtgen'

const wss = new WebSocketServer({ port: 3001 })
const messagesList = new ListManager('messages')
messagesList.connect()

setInterval(async () => {

  const length = await messagesList.length()
  if (length >= 100) {
    messagesList.lPop()
  }

  const { first_name, last_name } = KurdishNicknames.generate()
  const data = {
    username: `${first_name} ${last_name}`,
    time: Date.now(),
    value: sentence()
  }

  await messagesList.push(data)
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({ type: 'push', data })
      )
    }
  })
}, 5000)

wss.on('connection', ws => {

  ws.on('message', async data => {

    const { type, ...json } = JSON.parse(data)
    switch(type) {

      case 'get-all': {
        const data = parseList(
          await messagesList.getAll()
        )

        data.forEach((item, index) => item._id = index)
        return ws.send(
          JSON.stringify({ type, data })
        )
      }

      case 'push': {
        await messagesList.push(json)
        return ws.send(
          JSON.stringify({
            type,
            data: json
          })
        )
      }
    }
  })
})

function parseList(list) {
  return list.map(item => JSON.parse(item))
}
