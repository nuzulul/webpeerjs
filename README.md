# WebpeerJS
> Simple peer-to-peer with [IPFS](https://ipfs.tech/). Build completely P2P web applications, no trackers or relay servers involved.

WebpeerJS enables browser to browser connectivity without a central server.

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

- `createWebpeer()` Create a new local node.
- `id` The unique ID of the local node as an identity in the global network.
- `joinRoom()` Adding a local node to the room, returns an array of three functions (Sender, onListen, onMembers).
- `peers` Get all connected peers.

## License

MIT License

Copyright (c) 2024 [Nuzulul Zulkarnain](https://github.com/nuzulul)