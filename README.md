# WebpeerJS
> Simple peer-to-peer in the browser. Build completely P2P web applications, no trackers or relay servers required.

WebpeerJS enables browser to browser connectivity without a central server. Connecting people safely, privately, openly and reliably.

[Live Demo](https://nuzulul.github.io/webpeerjs/demo/)

## Features

* ✅ Decentralized Network
* ✅ Unlimited Peers
* ✅ Works in The Browser
* ✅ Broadcast Message

## Install

NPM :

```
npm i webpeerjs
```

Browser `<script>` tag :

Uses built-in JS files from [latest release](https://github.com/nuzulul/webpeerjs/releases/latest) or [CDN](https://www.jsdelivr.com/package/npm/webpeerjs) will make it's exports available as `webpeerjs` in the global namespace.

```
<script src="https://cdn.jsdelivr.net/npm/webpeerjs@0.0/dist/umd/webpeerjs.min.js"></script>
```

## Usage

```
import { webpeerjs } from 'webpeerjs'

void async function main() {

	const node = await webpeerjs.createWebpeer()
	
	console.log(`My node id : ${node.id}`)
	
	const [broadcast,listen,members] = node.joinRoom('globalroom')
	
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

