import fs from 'fs'
import dotenv from 'dotenv'
import { WSServer } from './core/ws-server'
import { generateFakeMessages } from './core/publish-fake-messages'

dotenv.config()

const cert = fs.readFileSync(process.env.WSS_CERT_PATH)
const key = fs.readFileSync(process.env.WSS_KEY_PATH)

const server = new WSServer(cert, key)

;(async () => {
  await server.bootstrap()
  generateFakeMessages(
    server,
    async () => server.messages.leftPopIfMoreThen(100)
  )
})();

