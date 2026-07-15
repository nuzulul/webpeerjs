# WebPEER

WebPEER is a Decentralized P2P Network in the Browser. It allows developers to build peer-to-peer webapps without relying on centralized servers or specialized browsers. Aims to return internet control back to users.

[>DEMO<](https://nuzulul.github.io/webpeerjs/demo/chat.html)

![WebPEER](webpeer.png)

## Spirit

In the early days of the World Wide Web, the internet was more open and more like a peer-to-peer network, where every user had equal standing on the network. This project aims to restore that early spirit through web standards, so that no single entity controls the network. However, the reality that standard web browsers have many limitations makes this dream a significant challenge. WebPEER seeks to address these challenges to see what is possible on today's web by reusing already invented components. Focus on being able to send messages across the network.

## Implementation

- [WebPEER.js](https://www.npmjs.com/package/webpeerjs)

The JavaScript implementation of WebPEER Network designed as a minimal, essential API. It uses IPFS and the libp2p modular stack for the specific purpose of propagating messages over the network via direct WebRTC connections between browsers. The consequence is that these messages can arrive asynchronously depending on how many iterations they have gone through.

## Bootstrapping

When a new peer is created, it doesn't know the addresses of existing peers on the network. While manually entering peer addresses is possible, it's impractical. WebPEER strategy is to use federated media, leveraging public protocols like [Torrent](https://github.com/nuzulul/signalingserver.js) to facilitate address exchange. Once the peer addresses are obtained, the peer can establish a direct browser-to-browser connection to the WebPEER Network.

## Unstructured

Browser-based peer-to-peer networks are known to have high churn rates, with peers frequently joining or leaving the network. Therefore, the WebPEER Network uses a simple, unstructured network. This simplicity offers the advantage of allowing the network to scale well.

## Security

WebPEER Network run over [`libp2p gossipsub`](https://docs.libp2p.io/concepts/security/security-considerations/#publish--subscribe) protocol to enables secure communication between peers. 
> By default, the gossipsub implementation will sign all messages with the author’s private key, and require a valid signature before accepting or propagating a message further. This prevents messages from being altered in flight, and allows recipients to authenticate the sender.

> However, as a cooperative protocol, it may be possible for peers to interfere with the message routing algorithm in a way that disrupts the flow of messages through the network.

## Benefit

* ✅ Decentralized
* ✅ True P2P
* ✅ Scalable
* ✅ Standard Web
* ✅ Standard Browser
* ✅ Broadcast Channel
* ✅ No Server
* ✅ No Cloud
* ✅ No Admin
* ✅ No Account
* ✅ No Database
* ✅ No Install
* ✅ No Limit
* ✅ Freedom

## Ideas

* Blockchain
* Voting / Polling
* Collaborative activity
* IoT
* Social media
* Remote control
* Multiplayer
* Distributed web
* Signalling
* Location tracker
* Activity tracker.
* Chat messenger

## Try it out!

* Go to a deployed chat demo at : [p2pchat](https://nuzulul.github.io/webpeerjs/demo/chat.html) .
* Open the app on another device.
* Both your devices should connected.
* Now start sending message.

## Browser Support
![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) ![Brave](https://raw.github.com/alrra/browser-logos/master/src/brave/brave_48x48.png) ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png)

## Quickstart

NPM:

```
npm install webpeerjs
```

CDN :

* [https://esm.sh/webpeerjs](https://esm.sh/webpeerjs)

```
<script type="importmap">
{
	"imports": {
		"webpeerjs" : "https://esm.sh/webpeerjs"
	}
}
</script>
```

## Usage

```
import { createWebPEER } from 'webpeerjs'

const config = {
	appName : 'myAppHelloWorld'
}

const peer = await createWebPEER();

console.log(`My peer id : ${peer.id}`)

const room = peer.joinRoom('lobbyroom')

room.onMessage((message,id) => {
	console.log(`Message from ${id} : ${message}`)
})

room.onMembers((data) => {
	console.log(`Members : ${data}`)
	room.sendMessage('hello')
})
	
```

## API

### `peer = await createWebPEER(config)`

Create a new peer.

`config` - Configuration object contains:

- `appName` - Unique application name.
		
### `peer.id`

Get the unique ID of this peer.

### `peer.status`

Get the peer status, returns `connecting` or `connected`.

- `connecting` - Currently not connected and is trying to connect to the network.
- `connected` - Currently connected to the network.

### `room = peer.joinRoom(namespace)`

Join to a room, returns an object.

- `room.sendMessage(message)` - Method to broadcast message.
- `romm.onMessage((message,peer_id)=>{})` - Listen on incoming broadcast message.
- `room.onMembers((members)=>{})` - Listen on members update when peer appears and disappears.

## See Also

- [p2p.js](https://github.com/nuzulul/p2p.js) - Alternative simple api WebRTC library with auto matchmaking without signaling server.

## License

[MIT](https://github.com/nuzulul/webpeerjs/blob/main/LICENSE) (c) 2024 [Nuzulul Zulkarnain](https://github.com/nuzulul)

