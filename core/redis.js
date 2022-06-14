import { createClient } from 'redis'

class RedisClient {
  constructor() {
    this.client = createClient()
    this.client.on(
      'error',
      error => console.log('Redis Client Error', error)
    )
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
  constructor(name) {
    super()
    this.name = name
  }

  lPop(count = 1) {
    return this.client.lPop(this.name, count)
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
