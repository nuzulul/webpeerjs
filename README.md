# WebPEER

WebPEER is a P2P Network that Runs in a Standard Browser. It allows developers to build peer-to-peer webapps without relying on centralized servers. Aims to return internet control back to users.

[>DEMO<](https://nuzulul.github.io/webpeerjs/demo/chat.html)

![WebPEER](webpeer.png)

## Security

WebPEER Network run over [`libp2p gossipsub`](https://docs.libp2p.io/concepts/security/security-considerations/#publish--subscribe) protocol to enables communication between peers. 
> By default, the gossipsub implementation will sign all messages with the author’s private key, and require a valid signature before accepting or propagating a message further. This prevents messages from being altered in flight, and allows recipients to authenticate the sender.

> However, as a cooperative protocol, it may be possible for peers to interfere with the message routing algorithm in a way that disrupts the flow of messages through the network.

## Benefit

* ✅ Distributed P2P Network
* ✅ Scalable Peers
* ✅ Accessible in Standard Browser
* ✅ Broadcast Channel Available
* ✅ No Need Server
* ✅ Freedom

## Ideas

* Blockchain
* Voting / Polling
* Collaborative activity
* IoT
* Social media
* Remote control
* Multiplayer games
* Distributed web
* Signalling protocol
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

NPM install:

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
	networkName : 'myNetwork'
}

const peer = await createWebPEER();

console.log(`My peer id : ${peer.id}`)

const room = peer.joinRoom('lobbyroom')

room.onMessage((message,id) => {
	console.log(`Message from ${id} : ${message}`)
})

room.onMembersChange((data) => {
	console.log(`Members : ${data}`)
	room.sendMessage('hello')
})
	
```

## API

### `peer = await createWebPEER(config)`

Create a new peer node.

`config` - Configuration object contains:

- `networkName` - Unique identifier name of the network to build.

- `rtcConfiguration` - **(optional)** Custom [rtcConfiguration](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection) for WebRTC connection.
		
### `peer.id`

Get the unique ID of this peer node.

### `peer.status`

Get the peer node status, returns `connecting` or `connected`.

- `connecting` - Currently not connected and is trying to connect to the network.
- `connected` - Currently connected to the network.

### `room = peer.joinRoom(namespace)`

Join to a room, returns an object.

- `room.sendMessage()` - Method to broadcast message to the room.
- `romm.onMessage((message,peer_id)=>{})` - Listen on incoming broadcast message.
- `room.onMembersChange((members)=>{})` - Listen on the room members update.

## See Also

- [p2p.js](https://github.com/nuzulul/p2p.js) - Alternative simple api WebRTC library with auto matchmaking without signaling server.

## License

[MIT](https://github.com/nuzulul/webpeerjs/blob/main/LICENSE) (c) 2024 [Nuzulul Zulkarnain](https://github.com/nuzulul)

