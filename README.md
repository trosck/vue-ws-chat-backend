# vue-ws-chat-backend

Backend ws with tls for [vue-ws-chat](https://github.com/trosck/vue-ws-chat)

## start project
copy `.env.example` and paste with name `.env`

```bash
cp .env.example .env
```

install dependencies

```bash
npm i
```

run project

```bash
npm run start
```

## message object 

```javascript
{
  type: String, // 'get-all' | 'push'
  username: String,
  value: String, // message
}
```

## message types

### get-all

get all messages

### push

publish message
