# WebpeerJS
> Simple peer-to-peer with [IPFS](https://ipfs.tech/). Build completely P2P web applications, no trackers or relay servers involved.

WebpeerJS enables browser to browser connectivity without a central server.

[Live Demo](https://nuzulul.github.io/webpeerjs/demo/)

## Install

NPM :

```
npm i webpeerjs
```

CDN :

```
<script src="https://cdn.jsdelivr.net/npm/webpeerjs@0.0/dist/umd/webpeerjs.min.js"></script>
```

## Usage

```
import { webpeerjs } from 'webpeerjs'

void async function main() {

	const node = await webpeerjs.createWebpeer()
	
	console.log(`My node id : ${node.id}`)
	
	const [broadcast,listen,members] = node.joinRoom('myroom')
	
	listen((message,id) => {
		console.log(`Message from ${id} : ${message}`)
	})
	
	members((data) => {
		console.log(`Members : ${data}`)
		broadcast('hello')
	})
	
}()
```

## API

- `createWebpeer()` Create a new node.
- `id` The unique ID of the node as an identity in the global network.
- `joinRoom()` Adding the node to the room, returns an array of three functions (Broadcaster, onListenMessage, onMembersUpdate).
- `peers` Get all connected peers.

## Maintainers

[Nuzulul Zulkarnain](https://github.com/nuzulul)