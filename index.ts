import fs from 'fs'
import dotenv from 'dotenv'
import { WSServer } from './core/ws-server.js'
import { generateFakeMessages } from './core/publish-fake-messages.js'

dotenv.config()

const server = new WSServer(
  fs.readFileSync(
    process.env.WSS_CERT_PATH ?? '',
    { encoding: 'utf-8' }
  ),
  fs.readFileSync(
    process.env.WSS_KEY_PATH ?? '',
    { encoding: 'utf-8' }
  )
)

;(async () => {
  await server.bootstrap()
  generateFakeMessages(
    server,
    async () => server.messages.leftPopIfMoreThen(100)
  )
})();

