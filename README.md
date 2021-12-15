# Simple Chat via Websocket

There are two dirs: 'backend' and 'frontend'.
From backend folder run:
```
npm i
node .
```
Then open in browser 'index.html' from 'frontend' folder and login, using the cred-data written on the newly opened page.
You can open many browsers / tabs and chat :)

There is also a server bot in the chat that periodically sends messages.

Backend uses wonderful 0-dependencies [ws](https://www.npmjs.com/package/ws) package, that implements websocket protocol.