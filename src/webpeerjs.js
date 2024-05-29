import { createDelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client'
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'
import { createLibp2p } from 'libp2p'
import { IDBBlockstore } from 'blockstore-idb'
import { IDBDatastore } from 'datastore-idb'
import { Key } from 'interface-datastore'
import { webTransport } from '@libp2p/webtransport'
import { webSockets } from '@libp2p/websockets'
import * as config from  './config'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { identify, identifyPush } from '@libp2p/identify'
import { multiaddr } from '@multiformats/multiaddr'
import first from 'it-first'
import { peerIdFromString } from '@libp2p/peer-id'
import { kadDHT, removePrivateAddressesMapper } from '@libp2p/kad-dht'
import { mkErr,PBPeer } from './utils'
import { sha256 } from 'multiformats/hashes/sha2'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { bootstrap } from '@libp2p/bootstrap'

class webpeerjs{
	
	//libp2p instance
	#libp2p
	
	//libp2p instance
	#helia
	
	//map [id,addrs] of discovered peers (addrs is array of address)
	#discoveredPeers
	
	//array of web peers id has found
	#webPeersId
	
	//database of best peer found saved here
	#dbstore
	#dbstoreData
	
	//map of [id,number_of_dialed] of good peers on #connectionTracker
	#dialedGoodPeers
	
	//boolean is dial websocket
	#isDialWebsocket
	
	//map [id,mddrs]
	#dialedKnownBootstrap
	
	//array of dialed discovered peers id
	#dialedDiscoveredPeers
	
	//object of joinRoom()
	#rooms
	
	//wap [id,addrs] of web peers (addrs is array of address)
	#connectedPeers
	
	//array of web peers id
	#connectedPeersArr
	
	//map [id,number_of_dialed] of #connectionTracker
	#connectionTrackerStore
	
	//map [id,addr] of all connections (addr is string of address)
	#connections
	
	//track disconnect event
	#trackDisconnect
	
	//list of dial multiaddress queue
	#dialQueue
	
	id
	status
	IPFS
	address
	peers
	
	constructor(helia,dbstore){
		
		this.#libp2p = helia.libp2p
		this.#helia = helia
		this.#dbstore = dbstore
		this.#dbstoreData = new Map()
		this.#discoveredPeers = new Map()
		this.#webPeersId = []
		this.#dialedGoodPeers = new Map()
		this.#isDialWebsocket = false
		this.#dialedKnownBootstrap = new Map()
		this.#dialedDiscoveredPeers = []
		this.address = []
		this.#rooms = {}
		this.#connectedPeers = new Map()
		this.#connectedPeersArr = []
		this.#connectionTrackerStore = new Map()
		this.#connections = new Map()
		this.#trackDisconnect = new Map()
		this.#dialQueue = []
		
		this.peers = (function(f) {
			return f
		})(this.#connectedPeersArr);
		
		this.status = (function(libp2p) {
			return libp2p.status
		})(this.#libp2p);

		this.IPFS = (function(helia,libp2p,discoveredPeers) {
			const obj = {helia,libp2p,discoveredPeers}
			return obj
		})(this.#helia,this.#libp2p,this.#discoveredPeers);
		
		this.id = this.#libp2p.peerId.toString()
		
		
		//listen to peer connect event
		this.#libp2p.addEventListener("peer:connect", (evt) => {
			//console.log(`Connected to ${connection.toString()}`);
			
			const connection = evt.detail;
			const id = evt.detail.toString()
			
			const connections = this.#libp2p.getConnections().map((con)=>{return {id:con.remotePeer.toString(),addr:con.remoteAddr.toString()}})
			const connect = connections.find((con)=>con.id == id)
			const addr = connect.addr
			this.#connections.set(id,addr)
			
			//announce via joinRoom version 1
			if(connection.toString() === config.CONFIG_KNOWN_BOOTSTRAP_PEER_IDS[0] || this.#webPeersId.includes(connection.toString())){
				setTimeout(()=>{
					this.#announce()
				},1000)
			}
			
		});


		//subscribe to pupsub topic
		this.#libp2p.services.pubsub.addEventListener('message', event => {
			//console.log('on:'+event.detail.topic,event.detail.data)
			if (event.detail.type !== 'signed') {
			  return
			}
			if(config.CONFIG_JOIN_ROOM_VERSION == 1){
				const topic = event.detail.topic
				const senderPeerId = event.detail.from.toString()
				if(config.CONFIG_PUBSUB_PEER_DISCOVERY.includes(topic)){
					try{
						//connect webpeer if disconnected
						let peers = []
						for(const peer of this.#libp2p.getPeers()){
							peers.push(peer.toString())
						}
						//dial if peers not connected and belong to webpeer
						if(!peers.includes(senderPeerId) && this.#webPeersId.includes(senderPeerId)){
							if(this.#connections.has(senderPeerId)){
								let mddrs = []
								const addr = this.#connections.get(senderPeerId)
								const mddr = multiaddr(addr)
								mddrs.push(mddr)
								this.#dialMultiaddress(mddrs)
							}
							else if(this.#discoveredPeers.has(senderPeerId)){
								const addrs = this.#discoveredPeers.get(senderPeerId)
								let mddrs = []
								for(const addr of addrs){
									const mddr = multiaddr(addr)
									mddrs.push(mddr)
								}
								this.#dialMultiaddress(mddrs)
							}
						}
						//parse the message over pupsub peer discovery
						const peer = PBPeer.decode(event.detail.data)
						const msg = uint8ArrayToString(peer.addrs[0])
						const json = JSON.parse(msg)
						const prefix =json.prefix
						const room = json.room
						const message = json.message
						const signal = json.signal
						const id = json.id
						if(id != senderPeerId)return
						const address = json.address
						if(prefix === config.CONFIG_PREFIX){
							if(room)this.#rooms[room].onMessage(message,id)
							if(signal){
								if(signal == 'announce'){
									setTimeout(()=>{this.#answer()},1000)
									if(!this.#connectedPeers.has(id))this.#onConnectFn(id)
									if(!this.#webPeersId.includes(id))this.#webPeersId.push(id)
									this.#connectedPeers.set(id,address)
									this.#connectedPeersArr.length = 0
									for(const peer of this.#connectedPeers){
										const item = {id:peer[0],address:peer[1]}
										this.#connectedPeersArr.push(item)
									}
									
								}
								if(signal == 'answer'){
									if(!this.#connectedPeers.has(id))this.#onConnectFn(id)
									if(!this.#webPeersId.includes(id))this.#webPeersId.push(id)
									this.#connectedPeers.set(id,address)
									this.#connectedPeersArr.length = 0
									for(const peer of this.#connectedPeers){	
										const item = {id:peer[0],address:peer[1]}
										this.#connectedPeersArr.push(item)
									}
									
								}
							}
						}

					}catch(err){}
				}else{
					const json = JSON.parse(topic)
					const room = json.room
					const message = new TextDecoder().decode(event.detail.data)
					this.#rooms[room].onMessage(message)
				}
			}
			
			if(config.CONFIG_JOIN_ROOM_VERSION == 2){
				const topic = event.detail.topic
				if(config.CONFIG_PUBSUB_PEER_DISCOVERY.includes(topic)){
					try{
						const peer = PBPeer.decode(event.detail.data)						
						const msg = uint8ArrayToString(peer.addrs[0])
						const json = JSON.parse(msg)
						const prefix =json.prefix
						const room = json.room
						const message = json.message
						if(prefix === config.CONFIG_PREFIX){
							this.#rooms[room].onMessage(message)
						}
					}catch(err){}
				}else{
					const json = JSON.parse(topic)
					const room = json.room
					const message = new TextDecoder().decode(event.detail.data)
					this.#rooms[room].onMessage(message)
				}
			}
			
		})
		
		
		//listen to peer discovery event
		this.#libp2p.addEventListener('peer:discovery', (evt) => {

			//console.log('Discovered:', evt.detail.id.toString())
			//console.log('Discovered: '+evt.detail.id.toString(), evt.detail.multiaddrs.toString())
			
			//Save peer discover
			
			const multiaddrs = evt.detail.multiaddrs
			const id = evt.detail.id
			
			if(multiaddrs.length != 0){
				let addrs = []
				for(const addr of multiaddrs){
					let peeraddr
					if(multiaddrs.toString().includes(evt.detail.id.toString())){
						//console.log('Discovered:', evt.detail.multiaddrs.toString())
						//Peer from pupsub peer discovery already has included self id
						peeraddr = addr.toString()
					}
					else{
						//other need to add id
						peeraddr = addr.toString()+'/p2p/'+id
					}
					addrs.push(peeraddr)
				}
				//save the new format multiaddrs
				this.#discoveredPeers.set(id.toString(), addrs)

				//track if peers like from relay dial it there is a chance from other browser node
				if(multiaddrs.toString().includes('certhash')&& multiaddrs.toString().includes('webtransport')){
					if(!this.#connections.has(id)){
						let mddrs = []
						for(const addr of addrs){
							const mddr = multiaddr(addr)
							mddrs.push(mddr)
						}
						this.#dialMultiaddress(mddrs)
					}
				}
			}
			else{
				//peer with empty address (multiaddrs = [])
				//this.#discoveredPeers.set(id.toString(), multiaddrs)
			}
			
		})

		
		//listen to peer disconnect event
		this.#libp2p.addEventListener("peer:disconnect",async (evt) => {
			
			const connection = evt.detail;
			//console.log(`Disconnected from ${connection.toCID().toString()}`);
			const id = evt.detail.string
			
			//track disconnect event
			if(this.#trackDisconnect.has(id)){
				let count = this.#trackDisconnect.get(id)
				count++
				this.#trackDisconnect.set(id,count)
				//console.log(this.#trackDisconnect)
				if(count>5){
					if(this.#dbstoreData.has(id)){
						await this.#dbstore.delete(new Key(id))
						this.#dbstoreData.delete(id)
					}
					
					if(!this.#webPeersId.includes(id) && !this.#dialedKnownBootstrap.has(id)){
						return
					}
				}
			}
			else{
				this.#trackDisconnect.set(id,0)
			}
			
			//if this disconnected peer is web peer redial it
			if(this.#connectedPeers.has(id)){
				const address = this.#connectedPeers.get(id)
				this.#connectedPeers.delete(id)
				this.#connectedPeersArr.length = 0
				for(const peer of this.#connectedPeers){	
					const item = {id:peer[0],address:peer[1]}
					this.#connectedPeersArr.push(item)
				}
				let mddrs = []
				for (const addr of address){
					const m = multiaddr(addr)
					mddrs.push(m)
				}
				this.#dialMultiaddress(mddrs)
				this.#onDisconnectFn(id)
			}
			
			//if this disconnected peer is known bootstrap redial it
			else if(this.#dialedKnownBootstrap.has(id)){
				const addr = this.#connections.get(id)
				let mddrs = []
				const addrs = multiaddr(addr)
				mddrs.push(addrs)
				this.#dialMultiaddress(mddrs)
			}
			
			//redial if this disconnected peer is regular peer
			else{
				const addr = this.#connections.get(id)
				let mddrs = []
				const addrs = multiaddr(addr)
				mddrs.push(addrs)
				this.#dialMultiaddress(mddrs)
			}
		});
		
		
		//Listen to self peer update
		this.#libp2p.addEventListener('self:peer:update', ({ detail: { peer } }) => {
			const multiaddrs = peer.addresses.map(({ multiaddr }) => multiaddr)
			//console.log(`changed multiaddrs: peer ${peer.id.toString()} multiaddrs: ${multiaddrs}`)
			const id = peer.id.toString()
			const mddrs = []
			peer.addresses.forEach((addr)=>{
				const maddr = addr.multiaddr.toString()+'/p2p/'+id
				if(maddr.includes('webtransport') && maddr.includes('certhash')){
					mddrs.push(maddr)
				}
			})
			this.#ListenAddressChange(mddrs)
			this.address = mddrs
			this.#answer()
		})
		  
		//setTimeout(async()=>{
		//},5000)
		
			//dial known peers from configuration
			this.#dialKnownPeers()
		
			//watch connection every 30s if none dial known peers again from configuration
			this.#watchConnection()		
		
			//if found good peers save to storage and reconnect if disconnect
			this.#connectionTracker()
			
			//periodically dial saved bootstrap address if disconnect
			this.#dialRandomBootstrap()
			
			//dial random discovered peers
			//this.#dialdiscoveredpeers()
		
		setInterval(()=>{
			this.#dialQueueList()
		},5e3)

	}




	/*
	PUBLIC FUNCTION
	*/

	//Listen on new peer connection
	#onConnectFn = () => {}
	onConnect = f => (this.#onConnectFn = f)


	//Listen on peer disconnect
	#onDisconnectFn = () => {}
	onDisconnect = f => (this.#onDisconnectFn = f)	




	/*
	PRIVATE FUNCTION
	*/
	
	#isConnected(id){
			let peers = []
			for(const peer of this.#libp2p.getPeers()){
				peers.push(peer.toString())
			}
			if(peers.includes(id)){
				return true
			}
			else{
				return false
			}
	}

	
	//add multiaddr address to queue list
	#dialMultiaddress(mddrs){
		this.#dialQueue.push(mddrs)
	}
	
	//dial multiaddr address in queue list
	#dialQueueList(){
		
		const mddrsToDial = 2
		
		for(let i = 0; i < mddrsToDial; i++){
			const mddrs = this.#dialQueue.shift()
			if(mddrs != undefined){

				//dial with webtransport
				this.#dialWebtransport(mddrs)
				
				//fallback dial with websocket if enabled
				if(this.#isDialWebsocket){
					this.#dialWebsocket(mddrs)
				}
				
			}
		}
		

	}
	

	//announce and answer via joinRoom version 1
	async #announce(){
			const topic = config.CONFIG_PEER_DISCOVERY_UNIVERSAL_CONNECTIVITY
			const data = JSON.stringify({prefix:config.CONFIG_PREFIX,signal:'announce',id:this.#libp2p.peerId.toString(),address:this.address})
			const peer = {
			  publicKey: this.#libp2p.peerId.publicKey,
			  addrs: [uint8ArrayFromString(data)],
			}
			const encodedPeer = PBPeer.encode(peer)
			await this.#libp2p.services.pubsub.publish(topic, encodedPeer)
	}
	async #answer(){
			const topic = config.CONFIG_PEER_DISCOVERY_UNIVERSAL_CONNECTIVITY
			const data = JSON.stringify({prefix:config.CONFIG_PREFIX,signal:'answer',id:this.#libp2p.peerId.toString(),address:this.address})
			const peer = {
			  publicKey: this.#libp2p.peerId.publicKey,
			  addrs: [uint8ArrayFromString(data)],
			}
			const encodedPeer = PBPeer.encode(peer)
			await this.#libp2p.services.pubsub.publish(topic, encodedPeer)
	}

	
	joinRoom = room => {
		if (this.#rooms[room]) {
			return [
				this.#rooms[room].sendMessage,
				this.#rooms[room].listenMessage
			]
			
			if (!room) {
				throw mkErr('room is required')
			}
		}
		
		//Join room version 1 user pupsub via libp2p universal connectivity
		if(config.CONFIG_JOIN_ROOM_VERSION == 1){

			const topic = config.CONFIG_PEER_DISCOVERY_UNIVERSAL_CONNECTIVITY
			//this.#libp2p.services.pubsub.subscribe(topic)
			
			this.#rooms[room] = {
				onMessage : () => {},
				listenMessage : f => (this.#rooms[room] = {...this.#rooms[room], onMessage: f}),
				sendMessage : async (message) => {
					const data = JSON.stringify({prefix:config.CONFIG_PREFIX,room,message,id:this.#libp2p.peerId.toString()})
					const peer = {
					  publicKey: this.#libp2p.peerId.publicKey,
					  addrs: [uint8ArrayFromString(data)],
					}
					const encodedPeer = PBPeer.encode(peer)
					await this.#libp2p.services.pubsub.publish(topic, encodedPeer)
				}
			}
		}

		//not implemented yet
		if(config.CONFIG_JOIN_ROOM_VERSION == 2){

			const topic = JSON.stringify({id:config.CONFIG_PREFIX,room})
			this.#libp2p.services.pubsub.subscribe(topic)
			
			this.#rooms[room] = {
				onMessage : () => {},
				listenMessage : f => (this.#rooms[room] = {...this.#rooms[room], onMessage: f}),
				sendMessage : async (message) => {
					await this.#libp2p.services.pubsub.publish(topic, new TextEncoder().encode(message))
				}
			}
		}
		
		return [
			this.#rooms[room].sendMessage,
			this.#rooms[room].listenMessage
		]
	}
	
	
	//Dial discovered peers
	#dialdiscoveredpeers(){
		setInterval(()=>{
			const keys = Array.from(this.#discoveredPeers.keys())
			for(const key of keys){
				if(!this.#dialedDiscoveredPeers.includes(key)){
					this.#dialedDiscoveredPeers.push(key)
					const addrs = this.#discoveredPeers.get(key)
					let mddrs = []
					for(const addr of addrs){
						const mddr = multiaddr(addr)
						mddrs.push(mddr)
					}
					this.#dialMultiaddress(mddrs)
					break
				}
			}
		},30*1000)
	}
	
	
	//Dial random known bootstrap periodically
	#dialRandomBootstrap(){
		setInterval(()=>{
			const keys = Array.from(this.#dialedKnownBootstrap.keys())
			const randomKey = Math.floor(Math.random() * keys.length)
			let id = keys[randomKey]
			//currently need universal connectivity id for webpeer discovery and joinRoom version 1 to work
			id = config.CONFIG_KNOWN_BOOTSTRAP_PEER_IDS[0]
			const addrs = this.#dialedKnownBootstrap.get(id)

			if(!this.#isConnected(id)){
				if(this.#connections.has(id))
				{
					let mddrs = []
					const addr = this.#connections.get(id)
					const mddr = multiaddr(addr)
					mddrs.push(mddr)
					this.#dialMultiaddress(mddrs)
				}
				else if (this.#dialedKnownBootstrap.has(id)){
					let mddrs = []
					const addrs = this.#dialedKnownBootstrap.get(id)
					for(const addr of addrs){
						const mddr = multiaddr(addr)
						mddrs.push(mddr)
					}
					this.#dialMultiaddress(mddrs)
				}
			}
		},30*1000)
	}
	
	
	//Track for good connection
	async #connectionTracker(){
		
		for await (const { key, value } of this.#dbstore.query({})) {
			const id = key.toString().split('/')[1]
			const addr = new TextDecoder().decode(value)
			this.#dbstoreData.set(id,addr)
		}	
		
		setInterval(async ()=>{
			
			//Save peer address if connection is good
			const connections = this.#libp2p.getConnections()
			for(const connect of connections){
				const peer = connect.remotePeer
				const remote = connect.remoteAddr
				const upgraded = connect.timeline.upgraded
				const bestlimit = 5*60*1000
				const now = new Date().getTime()
				const besttime = now-upgraded
				if(besttime>bestlimit){
					const addr = remote.toString()
					const id = peer.toString()
					if(!this.#webPeersId.includes(id) && !config.CONFIG_KNOWN_BOOTSTRAP_PEER_IDS.includes(id) && !this.#dbstoreData.get(id) && !addr.includes('p2p-circuit')){
						//await this.#dbstore.delete(new Key(id))
						await this.#dbstore.put(new Key(id), new TextEncoder().encode(addr))
						this.#dbstoreData.set(id,addr)
					}
				}
				const goodlimit = 60*1000
				const goodtime = now-upgraded
				if(goodtime>goodlimit){
					const id = peer.toString()
					if(!this.#dialedGoodPeers.has(id))this.#dialedGoodPeers.set(id,0)
				}
				
			}
			
			
			let peers = []
			for(const peer of this.#libp2p.getPeers()){
				peers.push(peer.toString())
			}
			
			
			//connect to saved best peer address
			//working great
			for(const peer of this.#dbstoreData){
				const id = peer[0]
				const addr = peer[1]
				if(peers.includes(id)){
					continue
				}else{
					if(this.#connectionTrackerStore.has(id)){
						let current = this.#connectionTrackerStore.get(id)
						if(current>10)continue
						current++
						this.#connectionTrackerStore.set(id,current)
					}
					else{
						this.#connectionTrackerStore.set(id,0)
					}
					let mddrs = []
					const mddr = multiaddr(addr)
					mddrs.push(mddr)
					this.#dialMultiaddress(mddrs)
				}
			}
			
			//Connect to good peer address if it is disconnected
			const goods = Array.from(this.#dialedGoodPeers.keys())
			for(const id of goods){
				if(peers.includes(id)){
					continue
				}
				else{					
					
					let count = this.#dialedGoodPeers.get(id)
					if (count < 5 || this.#dialedKnownBootstrap.has(id)){
						const addr = this.#connections.get(id)
						let mddrs = []
						const mddr = multiaddr(addr)
						mddrs.push(mddr)
						this.#dialMultiaddress(mddrs)
						count++
						this.#dialedGoodPeers.set(id,count)
					}
				}
			}
			
		},30*1000)
	}

	
	//Update listen address on change
	#ListenAddressChange = () => {}
	#onSelfAddress = f => (this.#ListenAddressChange = f)
	
	
	//Periodically watch for connection
	#watchConnection(){
		setInterval(()=>{
			const peers = this.#libp2p.getPeers().length
			if(peers == 0){
				this.#dialKnownPeers()
			}
		},60*1000)
	}
	
	
	//Dial to all known bootstrap peers and DNS
	#dialKnownPeers(){
		this.#dialKnownBootstrap()
		setTimeout(()=>{
			const peers = this.#libp2p.getPeers().length
			if(peers == 0){
				this.#dialKnownID()
				setTimeout(()=>{
					const peers = this.#libp2p.getPeers().length
					if(peers == 0){
						this.#dialKnownDNS()
						setTimeout(()=>{
							const peers = this.#libp2p.getPeers().length
							if(peers == 0){
								this.#dialKnownDNSonly()
							}
						},15000)
					}
				},15000)
			}
		},15000)
	}
	
	
	//Dial based on known bootsrap peers address
	#dialKnownBootstrap(){
		const bootstrap = config.CONFIG_KNOWN_BOOTSTRAP_PEERS_ADDRS
		for(const peer of bootstrap){
			const address = peer.Peers[0].Addrs
			const id = peer.Peers[0].ID
			let mddrs = []
			let addrs = []
			for(const addr of address){
				const peeraddr = addr+'/p2p/'+id
				const peermddr = multiaddr(peeraddr)
				addrs.push(peeraddr)
				mddrs.push(peermddr)
			}
			
			this.#dialedKnownBootstrap.set(id,addrs)
			if(!this.#isConnected(id)){
				this.#dialMultiaddress(mddrs)
			}
			
		}
	}
	
	
	//Dial based on known peers ID
	async #dialKnownID(){
		const api = config.CONFIG_DELEGATED_API
		const delegatedClient = createDelegatedRoutingV1HttpApiClient(api)
		const BOOTSTRAP_PEER_IDS = config.CONFIG_KNOWN_BOOTSTRAP_PEER_IDS
		const peers = await Promise.all(
			BOOTSTRAP_PEER_IDS.map((peerId) => first(delegatedClient.getPeers(peerIdFromString(peerId)))),
		)
		for(const peer of peers){
			if(!peer)return
			const address = peer.Addrs
			const id = peer.ID
			let mddrs = []
			let addrs = []
			for(const addr of address){
				const peeraddr = addr.toString()+'/p2p/'+id.toString()
				const peermddr = multiaddr(peeraddr)
				addrs.push(peeraddr)
				mddrs.push(peermddr)
			}
			
			this.#dialedKnownBootstrap.set(id,addrs)
			if(!this.#isConnected(id)){
				this.#dialMultiaddress(mddrs)
			}
		}
	}
	
	
	//Dial based on known bootstrap DNS
	async #dialKnownDNS(){
		const dnsresolver = config.CONFIG_DNS_RESOLVER
		const bootstrapdns = config.CONFIG_KNOWN_BOOTSTRAP_DNS
		const response = await fetch(dnsresolver+'?name='+bootstrapdns+'&type=txt')
		const json = await response.json()
		const dns = json.Answer
		const BOOTSTRAP_PEER_IDS = []
		for(const dnsaddr of dns){
			const id = dnsaddr.data.split('/').pop()
			BOOTSTRAP_PEER_IDS.push(id)
		}
		const api = config.CONFIG_DELEGATED_API
		const delegatedClient = createDelegatedRoutingV1HttpApiClient(api)
		const peers = await Promise.all(
			BOOTSTRAP_PEER_IDS.map((peerId) => first(delegatedClient.getPeers(peerIdFromString(peerId)))),
		)
		for(const peer of peers){
			const address = peer.Addrs
			const id = peer.ID
			let mddrs = []
			let addrs = []
			for(const addr of address){
				const peeraddr = addr.toString()+'/p2p/'+id.toString()
				const peermddr = multiaddr(peeraddr)
				addrs.push(peeraddr)
				mddrs.push(peermddr)
			}
			
			this.#dialedKnownBootstrap.set(id,addrs)
			if(!this.#isConnected(id)){
				this.#dialMultiaddress(mddrs)
			}
		}
		
	}
	
	
	//Dial based on known bootstrap DNS using DNS resolver only
	async #dialKnownDNSonly(){
		const dnsresolver = config.CONFIG_DNS_RESOLVER
		const bootstrapdns = config.CONFIG_KNOWN_BOOTSTRAP_DNS
		const response = await fetch(dnsresolver+'?name='+bootstrapdns+'&type=txt')
		const json = await response.json()
		const dns = json.Answer
		
		for(const dnsitem of dns){
			const arr = dnsitem.data.split('/')
			const id = arr.pop()
			const dnsaddr = '_dnsaddr.'+arr[2]
			this.#dialDNSWebsocketWebtransport(id,dnsaddr)
		}
	}
	
	
	//Dial DNS with webtransport and websocket
	async #dialDNSWebsocketWebtransport(id,dnsaddr){
		const dnsresolver = config.CONFIG_DNS_RESOLVER
		const response = await fetch(dnsresolver+'?name='+dnsaddr+'&type=txt')
		const json = await response.json()
		const dns = json.Answer
		let mddrs = []
		let addrs = []
		for(const dnsitem of dns){
			const arr = dnsitem.data.split('=')
			const dnsaddr = arr[1]
			const maddr = multiaddr(dnsaddr)
			mddrs.push(maddr)
			addrs.push(dnsaddr)
		}
		
		
		this.#isDialWebsocket = true
		this.#dialedKnownBootstrap.set(id,addrs)
		
		this.#dialedKnownBootstrap.set(id,addrs)
		if(!this.#isConnected(id)){
			this.#dialMultiaddress(mddrs)
			this.#dialWebsocket(mddrs)
		}
	}
	
	
	//Dial only webtransport multiaddrs
	async #dialWebtransport(multiaddrs){
			const webTransportMadrs = multiaddrs.filter((maddr) => maddr.protoNames().includes('webtransport')&&maddr.protoNames().includes('certhash'))
			  for (const addr of webTransportMadrs) {
				try {
				  //console.log(`attempting to dial webtransport multiaddr: %o`, addr.toString())
				  await this.#libp2p.dial(addr)
				  return // if we succeed dialing the peer, no need to try another address
				} catch (error) {
				  //console.log(`failed to dial webtransport multiaddr: %o`, addr.toString())
				}
			  }
	}
	
	
	//Dial only websocket multiaddrs
	async #dialWebsocket(multiaddrs){
			const webSocketMadrs = multiaddrs.filter((maddr) => maddr.protoNames().includes('wss'))
			  for (const addr of webSocketMadrs) {
				try {
				  //console.log(`attempting to dial websocket multiaddr: %o`, addr)
				  await this.#libp2p.dial(addr)
				  return // if we succeed dialing the peer, no need to try another address
				} catch (error) {
				  //console.log(`failed to dial websocket multiaddr: %o`, addr)
				}
			  }
	}
	
	
	//Entry point to webpeerjs
	static async createWebpeer(){
		
		const blockstore = new IDBBlockstore(config.CONFIG_BLOCKSTORE_PATH)
		//await blockstore.destroy()
		await blockstore.open()
		const datastore = new IDBDatastore(config.CONFIG_DATASTORE_PATH)
		//await datastore.destroy()
		await datastore.open()
		
		const dbstore = new IDBDatastore(config.CONFIG_DBSTORE_PATH)
		await dbstore.open()
		
		const bootstrapAddrs = []
		
		let addrs = []
		const getbootstrap = config.CONFIG_KNOWN_BOOTSTRAP_PEERS_ADDRS
		for(const peer of getbootstrap){
			const addrs = peer.Peers[0].Addrs
			const id = peer.Peers[0].ID
			let mddrs = []
			for(const addr of addrs){
				if(addr.includes('webtransport')&&addr.includes('certhash')){
					bootstrapAddrs.push(addr+'/p2p/'+id)
				}
			}
		}	
		
		//Create libp2p instance
		const libp2p = await createLibp2p({
			//datastore,
			addresses: {
				listen: [
				],
			},
			transports:[
				webTransport(),		
				//webSockets(),
				circuitRelayTransport({
					discoverRelays: config.CONFIG_DISCOVER_RELAYS,
				}),
			],
			connectionManager: {
				maxConnections: config.CONFIG_MAX_CONNECTIONS,
				minConnections: config.CONFIG_MIN_CONNECTIONS,
				autoDialInterval:60e3,
				autoDialConcurrency:5,
				autoDialMaxQueueLength:5,
				autoDialDiscoveredPeersDebounce:30e3,
				maxParallelDials: 10,
				dialTimeout: 10e3,
				maxIncomingPendingConnections: 5,
				maxDialQueueLength:10,
				inboundConnectionThreshold:3
			},
			connectionEncryption: [noise()],
			streamMuxers: [
				yamux({
					maxInboundStreams: 50,
					maxOutboundStreams: 50,
				})
			],
			connectionGater: {
				filterMultiaddrForPeer: async (peer, multiaddrTest) => {
					const multiaddrString = multiaddrTest.toString();
					if (
						multiaddrString.includes("/ip4/127.0.0.1") ||
						multiaddrString.includes("/ip6/")
					) {
						return false;
					}
					return true;
				},
				denyDialMultiaddr: async (multiaddrTest) => {
					const multiaddrString = multiaddrTest.toString();
					if (
						multiaddrString.includes("/ip4/127.0.0.1") ||
						multiaddrString.includes("/ip6/")
					) {
						return true;
					}
					return false;
				},
			},
			peerDiscovery: [
				pubsubPeerDiscovery({
					interval: 10_000,
					topics: config.CONFIG_PUBSUB_PEER_DISCOVERY,
					listenOnly: false,
				}),
				//bootstrap({list: bootstrapAddrs,})
			],
			services: {
				pubsub: gossipsub({
					allowPublishToZeroTopicPeers: true,
					msgIdFn: msgIdFnStrictNoSign,
					ignoreDuplicatePublishError: true,
				}),
				identify: identify(),
				identifyPush: identifyPush(),
				aminoDHT: kadDHT({
					protocol: '/ipfs/kad/1.0.0',
					peerInfoMapper: removePrivateAddressesMapper,
					clientMode: false
				}),
				//dht: kadDHT({})
			},
			peerStore: {
				persistence: true,
				threshold: 1
			}
		})
		
		
		
		//console.log(`Node started with id ${libp2p.peerId.toString()}`)

		
		//Create helia ipfs instance
		const helia = await createHelia({
			datastore,
			blockstore,
			libp2p
		})
		
		//await helia.libp2p.services.aminoDHT.setMode("server")
		
		
		//Return webpeerjs class
		return new webpeerjs(helia,dbstore)
	}
}


//Add id to pupsub message
async function msgIdFnStrictNoSign(msg){
  var enc = new TextEncoder()
  const signedMessage = msg
  const encodedSeqNum = enc.encode(signedMessage.sequenceNumber.toString())
  return await sha256.encode(encodedSeqNum)
}


//Export module
export default webpeerjs