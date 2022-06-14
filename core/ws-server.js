import https from 'https'
import { WebSocketServer } from 'ws'
import { ListManager } from './redis.js'

/**
 * parse redis list(string[])
 */
function parseList(list) {
  return list.map(item => JSON.parse(item))
}

export class WSServer {
  constructor(cert, key) {
    const server = new https.createServer({ cert, key })
    this.instance = new WebSocketServer({ server })
    this.messages = new ListManager('messages')
    this.handlers = {
      'get-all': this.getAllMessages.bind(this),
      'push': this.publishMessage.bind(this)
    }
  }

  async bootstrap(port = 3001) {
    server.listen(port)
    await this.messages.connect()

    this.instance.on('connection', ws => {
      ws.on('message', async data => {
        const { type, ...json } = JSON.parse(data)
        this.handlers[type]?.(ws, type, data)
      })
    })
  }

  async getAllMessages(socket, type, data) {
    const data = parseList(
      await messagesList.getAll()
    )

    data.forEach((item, index) => item._id = index)
    return socket.send(
      JSON.stringify({ type, data })
    )
  }

  async publishMessage(socket, type, data) {
    await messagesList.push(data)
    return socket.send(
      JSON.stringify({ type, data })
    )
  }
}
