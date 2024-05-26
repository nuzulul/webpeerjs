import webpeerjs from './../src/webpeerjs'

const statusValueEl = document.getElementById('statusValue')
const nodeIdEl = document.getElementById('nodeId')
const discoveredPeerCountEl = document.getElementById('discoveredPeerCount')
const connectedPeerCountEl = document.getElementById('connectedPeerCount')
const connectedPeersListEl = document.getElementById('connectedPeersList')
const multiaddressEl = document.getElementById('multiaddress')
const listenAddressCountEl = document.getElementById('listenAddressCount')

void async function main() {

	const node = await webpeerjs.createWebpeer()
	
	window.node = node

	setInterval(() => {
		statusValueEl.innerHTML = node.status === 'started' ? 'Online' : 'Offline'
		updateConnectedPeers()
		updateDiscoveredPeers()
		updateListenAddress()
	}, 500)

	nodeIdEl.innerHTML = node.id

	const updateDiscoveredPeers = () => {
	  discoveredPeerCountEl.innerHTML = node.IPFS.discoveredPeers.size
	}

	const updateConnectedPeers = () => {
	  const peers = node.IPFS.libp2p.getPeers()
	  connectedPeerCountEl.innerHTML = peers.length
	  connectedPeersListEl.innerHTML = ''
	  for (const peer of peers) {
		const peerEl = document.createElement('li')
		peerEl.innerText = peer.toString()
		connectedPeersListEl.appendChild(peerEl)
	  }
	}
	
	const updateListenAddress = () => {
		const address = node.address
		listenAddressCountEl.innerHTML = address.length
		multiaddressEl.innerHTML = ''
		for(const addr of address){
			const addrEl = document.createElement('li')
			addrEl.innerText = addr
			multiaddressEl.appendChild(addrEl)
		}
	}
	
	const [sendMessage,listenMessage] = node.joinRoom('universal-connectivity-browser-peer-discovery')
	listenMessage((msg)=>{
		console.log(msg)
	})
	
	setInterval(()=>{
		sendMessage(node.id)
	},5000)
	
}()