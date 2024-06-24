# WebpeerJS
> Simple peer-to-peer communication between applications in browser.

Build completely P2P web applications, no trackers or relay servers required. [WebpeerJS](https://github.com/nuzulul/webpeerjs) enables browser to browser connectivity without a central server. Connecting people safely, privately, openly and reliably. Let's create a next generation internet that is fair, free and open.

[Basic Connection Demo](https://nuzulul.github.io/webpeerjs/demo/)

## Features

* ✅ Decentralized P2P
* ✅ Unlimited Peers
* ✅ Works in Browsers
* ✅ Broadcast Message

## Quickstart

Try now in [Playground](https://jsbin.com/suwesaliro/1/edit?html,output) :
```
https://jsbin.com/suwesaliro/1/edit?html,output
```

NPM install:

```
npm i webpeerjs
```

Browser `<script>` tag :

Uses built-in JS files from [latest release](https://github.com/nuzulul/webpeerjs/releases/latest) or [CDN](https://www.jsdelivr.com/package/npm/webpeerjs) will make it's exports available as `webpeerjs` in the global namespace.

```
<script src="https://cdn.jsdelivr.net/npm/webpeerjs@0.1/dist/umd/webpeerjs.min.js"></script>
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

- `createWebpeer()` - Create a new node.
- `id` - The unique ID of the node as an identity in the global network.
- `status` - Get the node status, returns `connected` or `unconnected`.
- `peers` - Get all connected peers.
- `joinRoom(namespace)` - Join to the room, returns an array of three functions (Broadcaster, onListenBroadcast, onMembersUpdate).

## API Docs

[https://nuzulul.github.io/webpeerjs](https://nuzulul.github.io/webpeerjs)

## License

MIT

## Maintainers

[Nuzulul Zulkarnain](https://github.com/nuzulul)

