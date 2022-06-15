import https from 'https'
import WebSocket, { WebSocketServer } from 'ws'
import { ListManager } from './redis-client.js'

/**
 * parse redis list(string[])
 */
function parseList(list: string[]) {
  return list.map(item => JSON.parse(item))
}

export type ApiEndpointsTypes = 'get-all' | 'push'
export type EndpointFunctionType = (
  socket: WebSocket,
  type: ApiEndpointsTypes,
  data: any
) => void

export interface IWSServer {
  server: https.Server
  wss: WebSocketServer
  messages: ListManager
  // api endpoints handlers
  handlers: {
    [key: string]: EndpointFunctionType
  }

  // start server on specific port(default = 3001)
  bootstrap(port: number): void

  getAllMessages: EndpointFunctionType
  publishMessage: EndpointFunctionType

  sendToAllAvailableClients(data: any): any
}

export class WSServer implements IWSServer {
  server: https.Server
  wss: WebSocketServer
  messages: ListManager
  // api endpoints handlers
  handlers: {
    [key: string]: EndpointFunctionType
  }

  constructor(cert: string, key: string) {
    this.server = https.createServer({ cert, key })
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
