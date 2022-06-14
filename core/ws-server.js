import https from 'https'
import WebSocket, { WebSocketServer } from 'ws'
import { ListManager } from './redis.js'

/**
 * parse redis list(string[])
 */
function parseList(list) {
  return list.map(item => JSON.parse(item))
}

export class WSServer {
  constructor(cert, key) {
    this.server = new https.createServer({ cert, key })
    this.wss = new WebSocketServer({ server: this.server })
    this.messages = new ListManager('messages')
    this.handlers = {
      'get-all': this.getAllMessages.bind(this),
      'push': this.publishMessage.bind(this)
    }
  }

  async bootstrap(port = 3001) {
    await this.messages.connect()

    this.server.listen(port)
    this.server.on('upgrade', (request, socket, head) => {
      this.wss.handleUpgrade(request, socket, head, ws => {
        this.wss.emit('connection', ws, request)
      })
    })

    this.wss.on('connection', ws => {
      ws.on('message', async data => {
        const { type, ...json } = JSON.parse(data)
        this.handlers[type]?.(ws, type, json)
      })
    })
  }

  async getAllMessages(socket, type) {
    const parsedList = parseList(
      await this.messages.getAll()
    )

    parsedList.forEach((item, index) => item._id = index)
    return socket.send(
      JSON.stringify({ type, data: parsedList })
    )
  }

  async publishMessage(socket, type, data) {
    await this.messages.push(data)
    return this.sendToAllAvailableClients({ type, data })
  }

  async sendToAllAvailableClients(data) {
    return this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify(data)
        )
      }
    })
  }
}
