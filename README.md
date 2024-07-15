# WebPEER.js
> Decentralized P2P JS library for communication between applications in browser.

[WebPEER.js](https://github.com/nuzulul/webpeerjs) enables browser to browser connectivity without a central server. Build completely peer-to-peer web applications, no trackers or relay servers required. Connecting projects safely, privately, and reliably.

[Basic Connection Demo](https://nuzulul.github.io/webpeerjs/demo/)

## Security

WebPEER.js uses [`libp2p gossipsub`](https://docs.libp2p.io/concepts/security/security-considerations/#publish--subscribe) to enables communication between applications. 

## Features

* ✅ Decentralized P2P
* ✅ Scalable Peers
* ✅ Works in Browsers
* ✅ Broadcast Message

## Browser Support
![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Brave](https://raw.github.com/alrra/browser-logos/master/src/brave/brave_48x48.png) |
--- | --- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ |

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

