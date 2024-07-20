import {webpeerjs} from './../src/webpeerjs'

const statusValueEl = document.getElementById('statusValue')
const nodeIdEl = document.getElementById('nodeId')
const discoveredPeerCountEl = document.getElementById('discoveredPeerCount')
const connectedPeerCountEl = document.getElementById('connectedPeerCount')
const connectedPeersListEl = document.getElementById('connectedPeersList')
const multiaddressEl = document.getElementById('multiaddress')
const listenAddressCountEl = document.getElementById('listenAddressCount')
const connectedWebPeerCountEl = document.getElementById('connectedWebPeerCount')
const connectedWebPeersListEl = document.getElementById('connectedWebPeersList')
const logEl = document.getElementById('log')
const logCountEl = document.getElementById('logCount')

void async function main() {

	const node = await webpeerjs.createWebpeer()
	
	window.node = node

	setInterval(() => {
		//statusValueEl.innerHTML = node.status === 'started' ? 'Online' : 'Offline'
		statusValueEl.innerHTML = node.status
		updateConnectedPeers()
		updateDiscoveredPeers()
		updateListenAddress()
		updatePeers()
	}, 500)

	nodeIdEl.innerHTML = node.id
	
	function testplugin(callback){
		console.log('testplugin',callback.id)
	}
	node.plugin(testplugin)

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
	
	const updatePeers = ()=> {
		  const peers = node.peers
		  connectedWebPeerCountEl.innerHTML = peers.length
		  connectedWebPeersListEl.innerHTML = ''
		  for (const peer of peers) {
			const peerEl = document.createElement('li')
			peerEl.innerText = peer.id
			connectedWebPeersListEl.appendChild(peerEl)
		  }
	}
	
	let count = 0

	var getParams = function (url) {
		var params = {};
		var parser = document.createElement('a');
		parser.href = url;
		var query = parser.search.substring(1);
		var vars = query.split('&');
		for (var i = 0; i < vars.length; i++) {
		  var pair = vars[i].split('=');
		  params[pair[0]] = decodeURIComponent(pair[1]);
		}
		return params;
	};
	var params = getParams(window.location.href);
	
	let room = 'myroom'
	
	if (params.room != undefined){
		room = params.room
	}

	const [sendMessage,listenMessage,onMembersChange] = node.joinRoom(room)
	listenMessage((msg,id)=>{
		//console.log(msg,id)
		const log = document.createElement('li')
		log.innerText = id+' : '+msg
		logEl.appendChild(log)
		
		count++
		logCountEl.innerHTML = count
	})
	
	onMembersChange((members)=>{
		console.log('members',members)
	})
	
	let number = 0
	
	setInterval(()=>{
		sendMessage(number)
		number++
	},2000)
	
	node.onConnect((id)=>{
		console.log(`Connected to ${id}`)
	})
	
	node.onDisconnect((id)=>{
		console.log(`Disconnected from ${id}`);
	})
	
}()