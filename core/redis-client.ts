import { RedisClientType, createClient } from 'redis'

class RedisClient {
  client: RedisClientType

  constructor() {
    this.client = createClient()
  }

  async connect() {
    await this.client.connect()
    return this
  }

  async set(key, value) {
    await this.client.set(
      JSON.stringify(key),
      JSON.stringify(value)
    )

    return this
  }

  async get(key) {
    const value = await this.client.get(JSON.stringify(key))

    if (!value) return value

    try {
      return JSON.parse(value)
    } catch(e) {
      return value
    }
  }

  async listPushToEnd(name, item) {
    await this.client.rPush(
      name,
      JSON.stringify(item)
    )

    return this
  }

  async listGetAll(name) {
    return this.client.lRange(name, 0, -1)
  }
}

export class ListManager extends RedisClient {
  // list name
  name: string

  constructor(name) {
    super()
    this.name = name
  }

  lPop() {
    return this.client.lPop(this.name)
  }

  push(item) {
    return super.listPushToEnd(this.name, item)
  }

  getAll() {
    return super.listGetAll(this.name)
  }

  length() {
    return this.client.lLen(this.name)
  }

  async leftPopIfMoreThen(number) {
    const length = await this.length()
    if (length > number) {
      this.lPop()
    }
  }
}
