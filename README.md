# WebpeerJS
> Simple peer-to-peer with [IPFS](https://ipfs.tech/). Build completely P2P web applications, no trackers or relay servers required.

WebpeerJS enables browser to browser connectivity without a central server.

[Live Demo](https://nuzulul.github.io/webpeerjs/demo/)

## Features

* ✅ Decentralized Network
* ✅ Broadcast Message
* ✅ Works in The Browser

## Install

NPM :

```
npm i webpeerjs
```

Browser `<script>` tag :

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
- `status` Get the node status, returns `connected` or `unconnected`.
- `peers` Get all connected peers.
- `joinRoom(namespace)` Join to the room, returns an array of three functions (Broadcaster, onListenBroadcast, onMembersUpdate).

## API Docs

[https://nuzulul.github.io/webpeerjs](https://nuzulul.github.io/webpeerjs)

## Related

- [simple-peer](https://github.com/feross/simple-peer) - Simple WebRTC video, voice, and data channels.
- [peerjs](https://github.com/peers/peerjs) - Simple peer-to-peer with WebRTC.
- [trystero](https://github.com/dmotz/trystero) - Build instant multiplayer webapps, no server required.

## License

MIT

## Maintainers

[Nuzulul Zulkarnain](https://github.com/nuzulul)

