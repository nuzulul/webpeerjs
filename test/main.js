import webpeerjs from './../src/webpeerjs'

const statusValueEl = document.getElementById('statusValue')
const nodeIdEl = document.getElementById('nodeId')
const discoveredPeerCountEl = document.getElementById('discoveredPeerCount')
const connectedPeerCountEl = document.getElementById('connectedPeerCount')
const connectedPeersListEl = document.getElementById('connectedPeersList')
const multiaddressEl = document.getElementById('multiaddress')

const node = await webpeerjs.createWebpeer()

setInterval(() => {
	statusValueEl.innerHTML = node.status === 'started' ? 'Online' : 'Offline'
	updateConnectedPeers()
	updateDiscoveredPeers()
}, 500)

nodeIdEl.innerHTML = node.id

const updateDiscoveredPeers = () => {
  discoveredPeerCountEl.innerHTML = node.discoveredPeers.size
}

const updateConnectedPeers = () => {
  const peers = node.getPeers()
  connectedPeerCountEl.innerHTML = peers.length
  connectedPeersListEl.innerHTML = ''
  for (const peer of peers) {
    const peerEl = document.createElement('li')
    peerEl.innerText = peer.toString()
    connectedPeersListEl.appendChild(peerEl)
  }
}