# WebPEER
> Decentralized P2P network overlay inside browser

[WebPEER js](https://github.com/nuzulul/webpeerjs) library enables browser to browser connectivity without a central server. Instant build completely peer-to-peer network embeded in your web applications with scalable peers, no trackers or relay servers required. Connecting projects safely, privately, and reliably in the global WebPEER Network.

Basic Connection Demo available at : [https://nuzulul.github.io/webpeerjs/demo/](https://nuzulul.github.io/webpeerjs/demo/)

Basic Chat App Demo available at : [https://nuzulul.github.io/webpeerjs/demo/chat.html](https://nuzulul.github.io/webpeerjs/demo/chat.html)

## Security

WebPEER Network run over [`libp2p gossipsub`](https://docs.libp2p.io/concepts/security/security-considerations/#publish--subscribe) protocol to enables communication between peers. 
> By default, the gossipsub implementation will sign all messages with the author’s private key, and require a valid signature before accepting or propagating a message further. This prevents messages from being altered in flight, and allows recipients to authenticate the sender.

> However, as a cooperative protocol, it may be possible for peers to interfere with the message routing algorithm in a way that disrupts the flow of messages through the network.

## Features

* ✅ Decentralized P2P
* ✅ Scalable Peers
* ✅ Works in Browsers
* ✅ Broadcast Messages
* ✅ Censorship Resistant

## Ideas

* Blockchain
* Voting / Polling
* Collaborative activity
* IoT
* Censorship resistent social media
* Remote control
* Multiplayer games
* Decentralized/distributed web
* Signalling protocol
* Location tracker
* User activity tracker.

## Try it out!

* Go to a deployed chat demo at : [https://nuzulul.github.io/webpeerjs/demo/chat.html](https://nuzulul.github.io/webpeerjs/demo/chat.html) .
* Open the app on another device.
* Both your devices should connected.
* Now start sending message.

## Browser Support
![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Brave](https://raw.github.com/alrra/browser-logos/master/src/brave/brave_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) |
--- | --- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ❓ |

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

## Example

```
import { webpeerjs } from 'webpeerjs'

void async function main() {

	const node = await webpeerjs.createWebpeer()
	
	console.log(`My node id : ${node.id}`)
	
	const [broadcast,listen,onmembersupdate] = node.joinRoom('globalroom')
	
	listen((message,id) => {
		console.log(`Message from ${id} : ${message}`)
	})
	
	onmembersupdate((data) => {
		console.log(`Members : ${data}`)
		broadcast('hello')
	})
	
}()
```

## API

- `createWebpeer(config)` - Create a new node.
	- `config` - Configuration object contain:
		- `rtcConfiguration` - **(optional)** Custom [rtcConfiguration](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection) for WebRTC transport, currently the only transport available for direct peer-to-peer connectivity between browser.
- `id` - Get the unique ID of the node as an identity in the global network.
- `status` - Get the node status, returns `connected` or `unconnected`.
- `peers` - Get all connected peers.
- `joinRoom(namespace)` - Join to the room, returns an array of three functions, example : [Broadcaster, onListenBroadcast, onMembersUpdate].
	- `Broadcaster` - Function to broadcast message to room members (limited to 1 message/second as anti DOS mitigation).
	- `onListenBroadcast` - Callback function that listen on incoming broadcast message.
	- `onMembersUpdate` - Callback function that listen on room members update.

## API Docs

[https://nuzulul.github.io/webpeerjs](https://nuzulul.github.io/webpeerjs)

## License

MIT

## Maintainers

[Nuzulul Zulkarnain](https://github.com/nuzulul)

