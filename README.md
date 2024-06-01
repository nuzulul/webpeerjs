# WebPeerJS
Simple peer-to-peer with IPFS. Build completely P2P web applications, no trackers or relay servers required.

## Example

```
import { webpeerjs } from 'webpeerjs'

void async function main() {

	const node = await webpeerjs.createWebpeer()
	
	console.log(`My node id : ${node.id}`)
	
	const [send,listen,members] = node.joinRoom('myroom')
	
	send('hello')
	
	listen((message,id) => {
		console.log(`Message from ${id} : ${message}`)
	})
	
	members((data) => {
		console.log(`Members : ${data}`)
	})
	
}()
```

## Install

```
npm i webpeerjs
```

## API

- `createWebpeer()` Create new local node
- `id` Local node unique ID as identity in the global network
- `joinRoom()` Add local node to network room, return an array of three functions (sender, message listener, members update)

## License

MIT License

Copyright (c) 2024 Nuzulul Zulkarnain