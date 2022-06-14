import { sentence } from 'txtgen'
import { KurdishNicknames } from 'kurdish-nicknames'

function generateMessage() {
  const { first_name, last_name } = KurdishNicknames.generate()
  return {
    username: `${first_name} ${last_name}`,
    time: Date.now(),
    value: sentence()
  }
}

export function generateFakeMessages(
  wss,
  onInterval = () => {},
  interval = 5000
) {
  setInterval(async () => {
    await onInterval()

    const data = generateMessage()
    await wss.messages.push(data)

    wss.instance.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ type: 'push', data })
        )
      }
    })
  }, interval)
}
