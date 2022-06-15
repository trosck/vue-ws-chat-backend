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
  wsserver,
  onInterval = () => {},
  interval = 5000
) {
  setInterval(async () => {
    await onInterval()

    const data = generateMessage()
    await wsserver.messages.push(data)
    await wsserver.sendToAllAvailableClients({ type: 'push', data })
  }, interval)
}
