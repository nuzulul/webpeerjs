# WebpeerJS
> Simple peer-to-peer with [IPFS](https://ipfs.tech/). Build completely P2P web applications, no trackers or relay servers involved.

WebpeerJS enables browser to browser connectivity without a central server.

[Demo](https://nuzulul.github.io/webpeerjs/demo/)

## Example

```
import { webpeerjs } from 'webpeerjs'

void async function main() {

	const node = await webpeerjs.createWebpeer()
	
	console.log(`My node id : ${node.id}`)
	
	const [send,listen,members] = node.joinRoom('myroom')
	
	listen((message,id) => {
		console.log(`Message from ${id} : ${message}`)
	})
	
	members((data) => {
		console.log(`Members : ${data}`)
		send('hello')
	})
	
}()
```

## Install

NPM :

```
npm i webpeerjs
```

CDN :

```
<script src="https://cdn.jsdelivr.net/npm/webpeerjs@0.0/dist/umd/webpeerjs.min.js"></script>
```

## API

- `createWebpeer()` Create a new local node.
- `id` The unique ID of the local node as an identity in the global network.
- `joinRoom()` Adding a local node to the room, returns an array of three functions (Sender, onListen, onMembers).
- `peers` Get all connected peers.

## License

MIT License

Copyright (c) 2024 [Nuzulul Zulkarnain](https://github.com/nuzulul)