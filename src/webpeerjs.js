//! WebPEER.js -- https://github.com/nuzulul/webpeerjs

import * as config from  './config'
import { 
	mkErr,
	PBPeer,
	uint8ArrayToString,
	uint8ArrayFromString,
	first,
	Key,
	msgIdFnStrictNoSign,
	metrics,
	getDigest,
	mkDebug,
	multiaddr,
	pipe,
	lpStream,
	lp,
	map
} from './utils'
import { createDelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client'
import { createLibp2p } from 'libp2p'
import { IDBDatastore } from 'datastore-idb'
import { webTransport } from '@libp2p/webtransport'
import { webSockets } from '@libp2p/websockets'
import { webRTC } from '@libp2p/webrtc'
import { dcutr } from '@libp2p/dcutr'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { identify, identifyPush } from '@libp2p/identify'
import { peerIdFromString } from '@libp2p/peer-id'
import { kadDHT, removePrivateAddressesMapper } from '@libp2p/kad-dht'
import { simpleMetrics } from '@libp2p/simple-metrics'


class webpeerjs{
	
	//libp2p instance
	#libp2p
	
	//map [id,addrs] of discovered peers (addrs is array of address)
	#discoveredPeers
	
	//array of all webpeers id has been found
	#webPeersId
	
	//map [id,addrs]
	#webPeersAddrs
	
	//database of best peers has been found
	#dbstore
	#dbstoreData
	
	//map of [id,number_of_dialed] of good peers on #connectionTracker
	#dialedGoodPeers
	
	//boolean is dial websocket
	#isDialWebsocket
	
	//map [id,mddrs] of dialed bootstrap address
	#dialedKnownBootstrap
	
	//array of dialed discovered peers id
	//#dialedDiscoveredPeers
	
	//object from joinRoom()
	#rooms
	
	//map [id,addrs] of webpeers currently  connected  (addrs is array of address)
	#connectedPeers
	
	//array of we peers id proxy of #connectedPeers
	#connectedPeersArr
	
	//map [id,number_of_dialed] of #connectionTracker object store
	#connectionTrackerStore
	
	//map [id,addr] of all peers connections (addr is string of address)
	#connections
	
	//track disconnect event
	#trackDisconnect
	
	//list of dial multiaddress queue
	#dialQueue
	
	//is dial enabled
	#isDialEnabled
	
	//message tracker avoid double
	#msgIdtracker
	
	//map of peer exchange data
	#peerexchangedata
	
	//track last connect to webpeer network
	#lastTimeConnectToNetwork
	
	//arr to track on connect event
	#onConnectQueue
	
	id
	status
	IPFS
	address
	peers
	
	constructor(libp2p,dbstore,onMetrics){
		
		this.#libp2p = libp2p
		this.#dbstore = dbstore
		this.#dbstoreData = new Map()
		this.#discoveredPeers = new Map()
		this.#webPeersId = []
		this.#webPeersAddrs = new Map()
		this.#dialedGoodPeers = new Map()
		this.#isDialWebsocket = false
		this.#dialedKnownBootstrap = new Map()
		//this.#dialedDiscoveredPeers = []
		this.address = []
		this.#rooms = {}
		this.#connectedPeers = new Map()
		this.#connectedPeersArr = []
		this.#connectionTrackerStore = new Map()
		this.#connections = new Map()
		this.#trackDisconnect = new Map()
		this.#dialQueue = []
		this.#isDialEnabled = true
		this.#msgIdtracker = []
		this.#peerexchangedata = new Map()
		this.#lastTimeConnectToNetwork = new Date().getTime()
		this.#onConnectQueue = []
		
		this.peers = (function(f) {
			return f
		})(this.#connectedPeersArr);
		
		this.status = (function(libp2p) {
			return libp2p.status
		})(this.#libp2p);
		
		this.status = 'unconnected'

		this.IPFS = (function(libp2p,discoveredPeers) {
			const obj = {libp2p,discoveredPeers}
			return obj
		})(this.#libp2p,this.#discoveredPeers);
		
		this.id = this.#libp2p.peerId.toString()
		
		for(const topic of config.CONFIG_PUPSUB_PEER_DATA){
			this.#libp2p.services.pubsub.subscribe(topic)
		}

		for(const topic of config.CONFIG_PUBSUB_PEER_DISCOVERY_HYBRID){
			this.#libp2p.services.pubsub.subscribe(topic)
		}		
		
		//listen to peer connect event
		this.#libp2p.addEventListener("peer:connect",async (evt) => {
			
			const connection = evt.detail;
			const id = evt.detail.toString()
			
			//console.log('peer:connect '+id,evt)
			
			const connections = this.#libp2p.getConnections().map((con)=>{return {id:con.remotePeer.toString(),addr:con.remoteAddr.toString()}})
			const connect = connections.find((con)=>con.id == id)
			const addr = connect.addr

			if(config.CONFIG_KNOWN_BOOTSTRAP_PEERS_IDS.includes(id)){
				if((!this.#connections.has(id) || (this.#connections.get(id).includes('/wss/')))&&addr.includes('webtransport')){
					await this.#dbstore.put(new Key(id), new TextEncoder().encode(addr))
				}
			}

			this.#connections.set(id,addr)
			
			//required by joinRoom version 1 to announce via universal connectivity
			if(config.CONFIG_KNOWN_BOOTSTRAP_HYBRID_IDS.includes(id)){
				setTimeout(()=>{
					this.#peerDiscoveryHybrid()
					this.#announce()
					setTimeout(()=>{
						this.#peerDiscoveryHybrid()
						this.#announce()
					},5000)
				},1000)
			}
			
			if(this.#webPeersId.includes(id)){
				
				setTimeout(()=>{
					this.#ping()
				},10000)

				setTimeout(()=>{
					this.#ping()
				},15000)
				
				let address = [addr]

				if(this.#connectedPeers.has(id)){
					//reset this last seen
					const now = new Date().getTime()
					const metadata = {addrs:address,last:now}
					this.#connectedPeers.set(id,metadata)
				}
				else{
					//add to connected webpeers
					this.#onConnectFnUpdate(id)
					const now = new Date().getTime()
					const metadata = {addrs:address,last:now}
					this.#connectedPeers.set(id,metadata)
					this.#updatePeers()
				}

			}
			
		});


		//listen message from subscribed pupsub topic
		this.#libp2p.services.pubsub.addEventListener('message', event => {
			
			//console.log('on:'+event.detail.topic,event.detail.data)
			//console.log('from '+event.detail.from.toString(),event)
			//console.log('ontopic:'+event.detail.topic)
			
			if (event.detail.type !== 'signed') {
			  return
			}
			
			if(config.CONFIG_JOIN_ROOM_VERSION == 1){
				const topic = event.detail.topic
				const senderPeerId = event.detail.from.toString()
				
					try{
						
						//track last connect to webpeer network
						if(config.CONFIG_PUBSUB_PEER_DISCOVERY_WEBPEER.includes(topic)){
							const now = new Date().getTime()
							const limit = 15*1000
							const lastConnectTime = now - this.#lastTimeConnectToNetwork
							if(lastConnectTime > limit){
								//console.log('need re announce')
								this.#announce()
							}
							this.#lastTimeConnectToNetwork = now
						}
						
						//if it is webpeer 
						if(this.#webPeersId.includes(senderPeerId)){
							
							if(this.#connectedPeers.has(senderPeerId)){
								//reset this last seen
								const address = this.#connectedPeers.get(senderPeerId).addrs
								const now = new Date().getTime()
								const metadata = {addrs:address,last:now}
								this.#connectedPeers.set(senderPeerId,metadata)
							}
							else{
								//add to connected webpeers
								this.#onConnectFnUpdate(senderPeerId)
								const address = this.#webPeersAddrs.get(senderPeerId)
								const now = new Date().getTime()
								const metadata = {addrs:address,last:now}
								this.#connectedPeers.set(senderPeerId,metadata)
								this.#updatePeers()
							}

							//dial if not connected
							if(!this.#isConnected(senderPeerId)){
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
										if(!addr.includes('webrtc'))continue
										const mddr = multiaddr(addr)
										mddrs.push(mddr)
									}
									this.#dialMultiaddress(mddrs)
								}
								else if(this.#connectedPeers.has(senderPeerId)){
									const addrs = this.#connectedPeers.get(senderPeerId).addrs
									let mddrs = []
									for(const addr of addrs){
										if(!addr.includes('webrtc'))continue
										const mddr = multiaddr(addr)
										mddrs.push(mddr)
									}
									this.#dialMultiaddress(mddrs)
								}
							}


						}
						
						//parse the message over pupsub peer discovery
						const peer = PBPeer.decode(event.detail.data)
						
						//detect libp2p pupsub peer discovery
						if(peer.addrs.length > 1 && this.#libp2p.getPeers().length < config.CONFIG_MAX_CONNECTIONS){
							let mddrs = []
							for(const uaddr of peer.addrs){
								const mddr = multiaddr(uaddr)
								if(mddr.toString().includes('webtransport') && mddr.toString().includes('certhash')){
									mddrs.push(mddr)
								}
							}
							this.#dialMultiaddress(mddrs)
						}
						
						const msg = uint8ArrayToString(peer.addrs[0])
						const json = JSON.parse(msg)
						const prefix = json.prefix
						const room = json.room
						const rooms = json.rooms
						const message = json.message
						const msgId = json.msgId
						const signal = json.signal
						const id = json.id
						const address = json.address
						//console.log(`from ${id}:${signal} = ${msg}`)
						
						if(id != senderPeerId)return
						
						//detect special webpeer identity
						if(prefix === config.CONFIG_PREFIX){

							//add to webpeers id
							if(!this.#webPeersId.includes(id))this.#webPeersId.push(id)
							
							//add to connected webpeers
							if(!this.#connectedPeers.has(id)){
								this.#onConnectFnUpdate(id)
								address = []
								const now = new Date().getTime()
								const metadata = {addrs:address,last:now}
								this.#connectedPeers.set(id,metadata)
								this.#webPeersAddrs.set(id,address)
								this.#updatePeers()
							}

							
							if(room){
								if(this.#rooms[room]){
									
									//update room members
									if(!this.#rooms[room].members.includes(id)){
										if(this.#connectedPeers.has(id)){
											this.#rooms[room].members.push(id)
											this.#rooms[room].onMembers(this.#rooms[room].members)
										}
									}

									//inbound message
									if(message){
										const msgID = msgId+id
										if(!this.#msgIdtracker.includes(msgID)){
											this.#msgIdtracker.push(msgID)
											this.#rooms[room].onMessage(message,id)
										}
									}
									
								}
							}
							
							if(rooms){
								for(const room of rooms){
									
									if(this.#rooms[room]){
										
										//update room members
										if(!this.#rooms[room].members.includes(id)){
											if(this.#connectedPeers.has(id)){
												this.#rooms[room].members.push(id)
												this.#rooms[room].onMembers(this.#rooms[room].members)
											}
										}
										
									}
								}
							}
							
							if(signal){
								
								//repply announce with ping
								if(signal == 'announce'){
									setTimeout(()=>{this.#ping('')},1000)
									//console.log('rooms',rooms)
								}
								
								if(signal == 'ping'){
									//console.log('rooms',rooms)
								}
									
							}
						}
						else if(prefix === 'hybrid'){
							
							//console.log('hybrid' +id,address)
							const limit = config.CONFIG_MAX_CONNECTIONS / 2
							if(address.length>0 && ((!this.#connections.has(id))||(this.#connectedPeers.size < limit))){
								let mddrs = []
								for(const addr of address){
									const mddr = multiaddr(addr)
									mddrs.push(mddr)
								}
								this.#dialMultiaddress(mddrs)
							}
							
						}

					}catch(err){
						//console.log('from '+event.detail.from.toString())
						mkDebug(err)
					}
				
			}
			
		})
		
		
		//listen to peer discovery event
		this.#libp2p.addEventListener('peer:discovery', (evt) => {

			//console.log('Discovered:', evt.detail.id.toString())
			//console.log('Discovered: '+evt.detail.id.toString(), evt.detail.multiaddrs.toString())
			
			//save peer discover
			
			const multiaddrs = evt.detail.multiaddrs
			const id = evt.detail.id
			
			if(multiaddrs.length != 0){
				let addrs = []
				for(const addr of multiaddrs){
					let peeraddr
					if(multiaddrs.toString().includes(evt.detail.id.toString())){
						//console.log('Discovered:', evt.detail.multiaddrs.toString())
						//peer from pupsub peer discovery already has included self id
						peeraddr = addr.toString()
					}
					else{
						//other need to add Id
						peeraddr = addr.toString()+'/p2p/'+id
					}
					addrs.push(peeraddr)
				}
				//save the new format multiaddrs
				this.#discoveredPeers.set(id.toString(), addrs)

				//track if peer come from relay then dial it because there is a chance it is from other browser node
				if(multiaddrs.toString().includes('certhash')&& multiaddrs.toString().includes('webtransport') && multiaddrs.toString().includes('p2p-circuit')){
					//console.log(addrs)
					if(!this.#connections.has(id)){
						let mddrs = []
						for(const addr of addrs){
							if(!addr.includes('webrtc'))continue
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
			
			//const connection = evt.detail;
			//console.log(`Disconnected from ${connection.toCID().toString()}`);
			const id = evt.detail.string
			
			//track disconnect event
			if(this.#trackDisconnect.has(id)){
				let count = this.#trackDisconnect.get(id)
				count++
				this.#trackDisconnect.set(id,count)
				//console.log(this.#trackDisconnect)
				if(count>5){
					if(config.CONFIG_KNOWN_BOOTSTRAP_PUBLIC_IDS.includes(id)){
						return
					}
				}
				else if(count>10){
					if(this.#dbstoreData.has(id)){
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
			
			let peerexchangelist = []
			for(const peer of this.#peerexchangedata.values()){
				peerexchangelist.push(peer.id)
			}
			
			//if this disconnected peer is web peer redial it
			if(this.#webPeersId.includes(id)){
				const addr = this.#connections.get(id)
				let mddrs = []
				const mddr = multiaddr(addr)
				mddrs.push(mddr)
				this.#dialMultiaddress(mddrs)
			}
			
			//if this disconnected peer is known bootstrap redial it
			else if(this.#dialedKnownBootstrap.has(id)){
				const addr = this.#connections.get(id)
				if(addr.includes('/wss/'))return
				let mddrs = []
				const addrs = multiaddr(addr)
				mddrs.push(addrs)
				this.#dialMultiaddress(mddrs)
			}

			else if(peerexchangelist.includes(id)){
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
				//this.#dialMultiaddress(mddrs)
			}
		});
		
		
		//listen to self peer update
		this.#libp2p.addEventListener('self:peer:update', ({ detail: { peer } }) => {
			//const multiaddrs = peer.addresses.map(({ multiaddr }) => multiaddr)
			//console.log(`changed multiaddrs: peer ${peer.id.toString()} multiaddrs: ${multiaddrs}`)
			const id = peer.id.toString()
			const mddrs = []
			peer.addresses.forEach((addr)=>{
				const maddr = addr.multiaddr.toString()+'/p2p/'+id
				if(maddr.includes('webtransport') && maddr.includes('certhash')){
					mddrs.push(maddr)
				}
			})
			//this.#ListenAddressChange(mddrs)
			this.address = mddrs
			this.#ping()
			this.#peerDiscoveryHybrid()
		})
		
		this.#libp2p.addEventListener('peer:identify', async (evt) => {
			//console.log('peer:identify '+evt.detail.peerId.toString(),evt.detail)
			
			const id = evt.detail.peerId.toString()
			
			if(config.CONFIG_KNOWN_BOOTSTRAP_PUBLIC_IDS.includes(id)){
				const remoteAddr = evt.detail.connection.remoteAddr.toString()
				if(remoteAddr.includes('/wss/')){
					 let addrs = []
					 let mddrs = []
					 for(const peer of evt.detail.listenAddrs){
						 if(!peer.toString().includes('webtransport'))continue
						 const addr = peer.toString()+'/p2p/'+id
						 const mddr = multiaddr(addr)
						 addrs.push(addr)
						 mddrs.push(mddr)
					 }
					 this.#dialedKnownBootstrap.set(id,addrs)
					 await this.#libp2p.hangUp(peerIdFromString(id))
					 this.#dialMultiaddress(mddrs)
				}
			}
			
			if(evt.detail.protocols.includes(config.CONFIG_PROTOCOL)){
				//console.log('peer:identify '+evt.detail.peerId.toString(),evt)
				
				const id = evt.detail.peerId.toString()
				let address = []
				let mddrs = []
				
				for(const addrs of evt.detail.listenAddrs){
					const addr = addrs.toString()+'/p2p/'+id
					const mddr = multiaddr(addr)
					if(addr.includes('webtransport')){
						address.push(addr)
						mddrs.push(mddr)
					}
				}
				
				if(this.#connectedPeers.has(id)){
					//reset this last seen
					const now = new Date().getTime()
					const metadata = {addrs:address,last:now}
					this.#connectedPeers.set(id,metadata)
				}
				
				
				const command = 'peer-exchange'
				this.#dialProtocol(id,command)
				

			}
		})
		
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
		
		this.#registerProtocol()
		

		onMetrics((data)=>{
			const signal = metrics(data)
			this.#isDialEnabled = signal
			
		})
		
		setTimeout(()=>{
			this.#dialQueueList()
			setInterval(()=>{
				this.#dialQueueList()
			},5e3)
		},10e3)
		

		
		setInterval(()=>{
			this.#trackLastSeen()
		},5e3)
		
		setInterval(()=>{
			this.#peerDiscoveryHybrid()
		},10e3)
		

		/*setTimeout(async()=>{
			try{
				//console.log('getClosestPeers')
				const digest = await getDigest()
				//console.log('digest',digest)
				for await (const event of this.#libp2p.services.aminoDHT.getClosestPeers(digest)){
					if (event.name === 'FINAL_PEER'){
						//event.peer.multiaddrs.forEach((ma) => {
							//console.log(event.peer.id.toString(),ma.toString())
						//})
						//console.log(event.peer.id.toString(),event.peer.multiaddrs.toString())
					}
				}
			}
			catch(err){
				console.error('query error', err)
			}
		},60e3)*/
		
		/*setTimeout(async()=>{
			const key = uint8ArrayFromString(config.CONFIG_PREFIX)
			const value = uint8ArrayFromString(this.id)
			for await (const event of this.#libp2p.services.aminoDHT.put(key,value)){
				console.log('put',event)
			}
		},30e3)*/
		
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

	joinRoom = room => {
		if (this.#rooms[room]) {
			return [
				this.#rooms[room].sendMessage,
				this.#rooms[room].listenMessage,
				this.#rooms[room].onMembersChange
			]
			

		}

		if (!room) {
			throw mkErr('room is required')
		}
		
		//join room version 1 user pupsub via pupsub peer discovery
		if(config.CONFIG_JOIN_ROOM_VERSION == 1){

			let topics = []
			
			if(config.CONFIG_RUN_ON_TRANSIENT_CONNECTION == true){
				topics = config.CONFIG_PUBSUB_PEER_DISCOVERY_HYBRID
			}
			else{
				topics = config.CONFIG_PUPSUB_PEER_DATA
			}
			
			this.#rooms[room] = {
				onMessage : () => {},
				listenMessage : f => (this.#rooms[room] = {...this.#rooms[room], onMessage: f}),
				sendMessage : async (message) => {
					const msgId = (new Date()).getTime()
					const data = JSON.stringify({prefix:config.CONFIG_PREFIX,room,message,id:this.#libp2p.peerId.toString(),msgId})
					const arr = uint8ArrayFromString(data)
					const sizelimit = config.CONFIG_MESSAGE_SIZE_LIMIT
					if(arr.byteLength > sizelimit){
						throw mkErr('message too large')
					}
					const peer = {
					  publicKey: this.#libp2p.peerId.publicKey,
					  addrs: [arr],
					}
					const encodedPeer = PBPeer.encode(peer)
					for(const topic of topics){
						await this.#libp2p.services.pubsub.publish(topic, encodedPeer)
					}
				},
				members : [this.id],
				onMembers : () => {},
				onMembersChange : f => {this.#rooms[room] = {...this.#rooms[room], onMembers: f};this.#rooms[room].onMembers(this.#rooms[room].members);this.#ping()},
			}
		}
		
		return [
			this.#rooms[room].sendMessage,
			this.#rooms[room].listenMessage,
			this.#rooms[room].onMembersChange
		]
	}
	
	dial(addr){
		let mddrs = []
		const mddr = multiaddr(addr)
		mddrs.push(mddr)
		this.#dialMultiaddress(mddrs)
	}


	/*
	PRIVATE FUNCTION
	*/
	
	//prevent double on connect event
	#onConnectFnUpdate(id){
		if(!this.#onConnectQueue.includes(id)){
			this.#onConnectQueue.push(id)
			this.#onConnectFn(id)
			setTimeout(()=>{
				const index = this.#onConnectQueue.indexOf(id)
				if (index > -1) {
					this.#onConnectQueue.splice(index, 1)
				}
			},5000)
		}
	}

	#updatePeers(){
		this.#connectedPeersArr.length = 0
		for(const peer of this.#connectedPeers){	
			const item = {id:peer[0],address:peer[1].addrs}
			this.#connectedPeersArr.push(item)
		}
		if(this.#connectedPeers.size > 0){
			this.status = 'connected'
		}
		else{
			this.status = 'unconnected'
		}
		this.#ping()
	}
	
	async #registerProtocol(){
		
		const handler = async ({ connection, stream, protocol }) => {
			try{
				const output = await pipe(
					stream.source,
					(source) => lp.decode(source),
					(source) => map(source, (buf) => uint8ArrayToString(buf.subarray())),
					async function (source) {
					  let string = ''
					  for await (const msg of source) {
						string += msg.toString()
					  }
					  return string
					}
				)
				
				const id = connection.remotePeer.toString()
				
				let json = JSON.parse(output)

				let jsonMessage = {
						protocol:config.CONFIG_PROTOCOL,
						command:null,
						data:null
				}
				
				if(json.command === 'peer-exchange'){
					
					if(json.protocol == config.CONFIG_PROTOCOL){
						const address = [connection.remoteAddr.toString()]
						if(this.#connectedPeers.has(id)){
							//reset this last seen
							const now = new Date().getTime()
							const metadata = {addrs:address,last:now}
							this.#connectedPeers.set(id,metadata)
						}
						else{
							if(!this.#webPeersId.includes(id))this.#webPeersId.push(id)
								
							//add to connected webpeers
							this.#onConnectFnUpdate(id)
							const now = new Date().getTime()
							const metadata = {addrs:address,last:now}
							this.#connectedPeers.set(id,metadata)
							this.#updatePeers()
						}
					}
					
					if(json.data != null){
						this.#peerexchangedata.set(id,json.data)
						let mddrs = []
						const dataaddr = json.data.addr
						const datamddr = multiaddr(dataaddr)
						const dataid = json.data.id
						mddrs.push(datamddr)
						this.#dialMultiaddress(mddrs)
						if(!this.#dbstoreData.has(dataid)){
							//await this.#dbstore.put(new Key(dataid), new TextEncoder().encode(dataaddr))
							//this.#dbstoreData.set(dataid,dataaddr)
						}
					}
					
					const keys = Array.from(this.#dbstoreData.keys())
					const randomKey = Math.floor(Math.random() * keys.length)
					const key = keys[randomKey]
					const addr = this.#dbstoreData.get(key)
					
					jsonMessage.command = json.command
					jsonMessage.data = {id:key,addr}	
				}
				
				const message = JSON.stringify(jsonMessage)
				//console.log('answer message '+id,message)
				
				pipe(
					message,
					(source) => map(source, (string) => uint8ArrayFromString(string)),
					(source) => lp.encode(source),
					stream.sink
				)
			}
			catch(err){
				//console.warn(err)
			}
		}

		await this.#libp2p.handle(config.CONFIG_PROTOCOL, handler, {
		  maxInboundStreams: 100,
		  maxOutboundStreams: 100,
		  runOnTransientConnection:config.CONFIG_RUN_ON_TRANSIENT_CONNECTION
		})

		await this.#libp2p.register(config.CONFIG_PROTOCOL, {
		  onConnect: (peer, connection) => {
			// handle connect
			//console.log('handle connect',peer)
		  },
		  onDisconnect: (peer, connection) => {
			// handle disconnect
			//console.log('handle disconnect',peer)
		  }
		})

	}
	
	async #dialProtocol(id,command){

		const connections = this.#libp2p.getConnections().map((con)=>{return {id:con.remotePeer.toString(),addr:con.remoteAddr.toString()}})
		const connect = connections.find((con)=>con.id == id)
		const addr = connect.addr
		const mddr = multiaddr(addr)
		
		let jsonMessage = {
				protocol:config.CONFIG_PROTOCOL,
				command:null,
				data:null
		}
		
		if(command === 'peer-exchange'){
			
			if(this.#peerexchangedata.has(id))return
			
			const keys = Array.from(this.#dbstoreData.keys())
			const randomKey = Math.floor(Math.random() * keys.length)
			const key = keys[randomKey]
			const addr = this.#dbstoreData.get(key)
			
			jsonMessage.command = command
			jsonMessage.data = {id:key,addr}
		}
		
		const message = JSON.stringify(jsonMessage)		
		//console.log('ask message '+id,message)

		try{
			
			const stream = await this.#libp2p.dialProtocol(mddr, config.CONFIG_PROTOCOL,{runOnTransientConnection:config.CONFIG_RUN_ON_TRANSIENT_CONNECTION})
			
			const output = await pipe(
				message,
				(source) => map(source, (string) => uint8ArrayFromString(string)),
				(source) => lp.encode(source),
				stream,
				(source) => lp.decode(source),
				(source) => map(source, (buf) => uint8ArrayToString(buf.subarray())),
				async function (source) {
				  let string = ''
				  for await (const msg of source) {
					string += msg.toString()
				  }
				  return string
				}
			)
			//console.log(output)
			const json = JSON.parse(output)
			if(json.protocol == config.CONFIG_PROTOCOL){
				const address = [addr]
				if(this.#connectedPeers.has(id)){
					//reset this last seen
					const now = new Date().getTime()
					const metadata = {addrs:address,last:now}
					this.#connectedPeers.set(id,metadata)
				}
				else{
					if(!this.#webPeersId.includes(id))this.#webPeersId.push(id)
						
					//add to connected webpeers
					this.#onConnectFnUpdate(id)
					const now = new Date().getTime()
					const metadata = {addrs:address,last:now}
					this.#connectedPeers.set(id,metadata)
					this.#updatePeers()
				}
			}
			if(json.command == 'peer-exchange'){
				if(json.data != null){
					this.#peerexchangedata.set(id,json.data)
					let mddrs = []
					const dataaddr = json.data.addr
					const datamddr = multiaddr(dataaddr)
					const dataid = json.data.id
					mddrs.push(datamddr)
					this.#dialMultiaddress(mddrs)
					if(!this.#dbstoreData.has(dataid)){
						//await this.#dbstore.put(new Key(dataid), new TextEncoder().encode(dataaddr))
						//this.#dbstoreData.set(dataid,dataaddr)
					}
				}
			}
		}
		catch(err){
			//console.warn(err)
		}
	}
	
	async #findHybridPeer(){

		if(!navigator.onLine)return
		if(!this.#isDialEnabled)return

		for(const target of config.CONFIG_KNOWN_BOOTSTRAP_HYBRID_IDS){
			if(!this.#isConnected(target) && !this.#connections.has(target)){
				//console.log('findPeer',target)
				const peerId = peerIdFromString(target)
				//const peerInfo = await this.#libp2p.services.aminoDHT.findPeer(peerId)

				//console.info(peerInfo)
				for await (const event of this.#libp2p.services.aminoDHT.findPeer(peerId)){
					//console.info('findPeer',event)
					if (event.name === 'FINAL_PEER'){
						//console.log(event.peer.id.toString(),event.peer.multiaddrs.toString())
						let mddrs = []
						let addrs = []
						const id = event.peer.id.toString()
						for(const mddr of event.peer.multiaddrs){
							const peeraddr = mddr.toString()+'/p2p/'+id
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
			}
		}
	}
	
	
	//check the last seen in web peer
	#trackLastSeen(){
		const timeout = 25*1000
		const forcetimeout = 60*1000
		const now = new Date().getTime()
		
		//if webpeer last seen grather then timeout send onDisconnect
		for(const peer of this.#connectedPeers){
			const id = peer[0]
			const last = peer[1].last
			const time = now-last
			if((time>timeout && !this.#isConnected(id))||(time>forcetimeout)){
				
				this.#connectedPeers.delete(id)
				this.#updatePeers()
				this.#onDisconnectFn(id)
				
				//remove id from room member
				const rooms = Object.keys(this.#rooms)
				for(const room of rooms){
					if(this.#rooms[room].members.includes(id)){
						const index = this.#rooms[room].members.indexOf(id)
						this.#rooms[room].members.splice(index,1)
						this.#rooms[room].onMembers(this.#rooms[room].members)
					}
				}
				
			}
		}
	}
	
	//check if this id is connected
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
	async #dialMultiaddress(mddrs){
		if(mddrs.length>0){
			
			const id = mddrs[0].toString().split('/').pop()
			
			const queueids = this.#dialQueue.map((arr)=> arr[0].toString().split('/').pop())
			
			//if peer id is already in the queque cancel queque
			if(queueids.includes(id)){
				return
			}
			
			if(this.status === 'connected' && config.CONFIG_KNOWN_BOOTSTRAP_PUBLIC_IDS.includes(id))return
			
			const webPeerCount = this.#connectedPeers.size
			const allPeerCount = this.#libp2p.getPeers().length
			const nodePeerCount = allPeerCount - webPeerCount
			const limitCount = config.CONFIG_MAX_CONNECTIONS / 2
			
			if(this.#webPeersId.includes(id)){
				if(webPeerCount>limitCount){
					return
				}
			}
			else{
				if((nodePeerCount>(limitCount-5))||(allPeerCount>(config.CONFIG_MAX_CONNECTIONS-5))){
					//close random peers
					let peers = []
					for(const peer of this.#libp2p.getPeers()){
						peers.push(peer.toString())
					}
					const randomKey = Math.floor(Math.random() * peers.length)
					const randompeerid = peers[randomKey]
					if(!config.CONFIG_KNOWN_BOOTSTRAP_HYBRID_IDS.includes(id)){
						await this.#libp2p.hangUp(peerIdFromString(randompeerid))
					}
				}
			}
			
			if(this.#webPeersId.includes(id) || config.CONFIG_KNOWN_BOOTSTRAP_PEERS_IDS.includes(id) || config.CONFIG_KNOWN_BOOTSTRAP_HYBRID_IDS.includes(id)){
				this.#dialQueue.unshift(mddrs)
			}
			else{
				this.#dialQueue.push(mddrs)
			}
			
		}
	}
	
	//dial multiaddr address in queue list
	#dialQueueList(){
		
		if(!this.#isDialEnabled || !navigator.onLine || (document.visibilityState === 'hidden' && ('ontouchstart' in document.documentElement)) )return
		
		const mddrsToDial = 5
		
		let queue = []
		for(const item of this.#libp2p.getDialQueue()){
			const id = item.peerId.string
			queue.push(id)
		}
		
		if (queue.length > mddrsToDial)return
		
		for(let i = 0; i < mddrsToDial; i++){
			const mddrs = this.#dialQueue.shift()
			if(mddrs != undefined && mddrs.length>0){
				
				const id = mddrs[0].toString().split('/').pop()
				
				if(this.#isConnected(id))continue
				if(queue.includes(id)){continue;}
				
				//console.log('dial',id)

				//dial with webtransport
				this.#dialWebtransport(mddrs)
				
				//fallback dial with websocket if enabled
				if(this.#isDialWebsocket){
					this.#dialWebsocket(mddrs)
				}
				
			}
			else{
				break
			}
		}

	}
	

	//announce and ping via pupsub peer discovery hybrid
	async #peerDiscoveryHybrid(){
			const topics = config.CONFIG_PUBSUB_PEER_DISCOVERY_HYBRID
			const data = JSON.stringify({prefix:'hybrid',id:this.#libp2p.peerId.toString(),address:this.address})
			const peer = {
			  publicKey: this.#libp2p.peerId.publicKey,
			  addrs: [uint8ArrayFromString(data)],
			}
			const encodedPeer = PBPeer.encode(peer)
			for(const topic of topics){
				await this.#libp2p.services.pubsub.publish(topic, encodedPeer)
			}
	}
	
	async #announce(){
			let topics = []
			
			if(config.CONFIG_RUN_ON_TRANSIENT_CONNECTION == true){
				topics = config.CONFIG_PUBSUB_PEER_DISCOVERY_HYBRID
			}
			else{
				topics = config.CONFIG_PUPSUB_PEER_DATA
			}
			const data = JSON.stringify({prefix:config.CONFIG_PREFIX,signal:'announce',id:this.#libp2p.peerId.toString(),address:this.address,rooms:Object.keys(this.#rooms)})
			const peer = {
			  publicKey: this.#libp2p.peerId.publicKey,
			  addrs: [uint8ArrayFromString(data)],
			}
			const encodedPeer = PBPeer.encode(peer)
			for(const topic of topics){
				await this.#libp2p.services.pubsub.publish(topic, encodedPeer)
			}
	}
	
	async #ping(){
			let topics = []
			
			if(config.CONFIG_RUN_ON_TRANSIENT_CONNECTION == true){
				topics = config.CONFIG_PUBSUB_PEER_DISCOVERY_HYBRID
			}
			else{
				topics = config.CONFIG_PUPSUB_PEER_DATA
			}
			const data = JSON.stringify({prefix:config.CONFIG_PREFIX,signal:'ping',id:this.#libp2p.peerId.toString(),address:this.address,rooms:Object.keys(this.#rooms)})
			const peer = {
			  publicKey: this.#libp2p.peerId.publicKey,
			  addrs: [uint8ArrayFromString(data)],
			}
			const encodedPeer = PBPeer.encode(peer)
			for(const topic of topics){
				await this.#libp2p.services.pubsub.publish(topic, encodedPeer)
			}
	}
	
	
	//dial discovered peers
	/*#dialdiscoveredpeers(){
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
	}*/
	
	
	//dial random known bootstrap periodically
	#dialRandomBootstrap(){
		setInterval(()=>{
			//const keys = Array.from(this.#dialedKnownBootstrap.keys())
			const keys = config.CONFIG_KNOWN_BOOTSTRAP_PEERS_IDS
			const randomKey = Math.floor(Math.random() * keys.length)
			let ids = []
			ids.push(keys[randomKey])
			
			//universal connectivity id for webpeer discovery and joinRoom version 1 to work
			for(const id of config.CONFIG_KNOWN_BOOTSTRAP_HYBRID_IDS){
				ids.push(id)
			}
			
			for(const id of ids){
				if(id == undefined)continue
				//const addrs = this.#dialedKnownBootstrap.get(id)

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
					else{
						const bootstrap = config.CONFIG_KNOWN_BOOTSTRAP_PEERS_ADDRS
						const index = bootstrap.findIndex((peer)=>peer.Peers[0].ID == id)
						if(index > -1){
							const addrs = bootstrap[index].Peers[0].Addrs
							let mddrs = []
							for(const addr of addrs){
								const peeraddr = addr+'/p2p/'+id
								const mddr = multiaddr(peeraddr)
								mddrs.push(mddr)
							}
							this.#dialMultiaddress(mddrs)
						}
					}
				}
			}
		},45*1000)
	}
	
	
	//track for good connection
	async #connectionTracker(){
		
		for await (const { key, value } of this.#dbstore.query({})) {
			const id = key.toString().split('/')[1]
			const addr = new TextDecoder().decode(value)
			this.#dbstoreData.set(id,addr)
		}	
		
		setInterval(async ()=>{
			
			//save peer address if connection is good
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
					if(!this.#webPeersId.includes(id) && !config.CONFIG_KNOWN_BOOTSTRAP_PEERS_IDS.includes(id) && !this.#dbstoreData.has(id) && !addr.includes('p2p-circuit') && addr.includes('webtransport')){
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
			
			
			//connect to saved best peer address
			//working great
			for(const peer of this.#dbstoreData){
				const id = peer[0]
				const addr = peer[1]
				if(this.#isConnected(id)){
					this.#connectionTrackerStore.set(id,0)
					continue
				}else{
					if(this.#connectionTrackerStore.has(id)){
						let current = this.#connectionTrackerStore.get(id)
						current++
						this.#connectionTrackerStore.set(id,current)
						if(current>5){
							if(!this.#connections.has(id) && !config.CONFIG_KNOWN_BOOTSTRAP_PEERS_IDS.includes(id) && navigator.onLine)
							{
								setTimeout(async ()=> {
									if(this.#dbstoreData.has(id) && !this.#connections.has(id)){
										this.#dbstoreData.delete(id)
										await this.#dbstore.delete(new Key(id))
									}
								},60*1000)
							}
							continue
						}
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
			
			//connect to good peer address if it is disconnected
			const goods = Array.from(this.#dialedGoodPeers.keys())
			for(const id of goods){
				if(this.#isConnected(id)){
					this.#dialedGoodPeers.set(id,0)
					continue
				}
				else{					
					
					let count = this.#dialedGoodPeers.get(id)
					if (count < 15 || (count < 25 && this.#dialedKnownBootstrap.has(id))){
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
			
		},15*1000)
	}

	
	//update listen address on change
	//#ListenAddressChange = () => {}
	//#onSelfAddress = f => (this.#ListenAddressChange = f)
	
	
	//Periodically watch for connection
	#watchConnection(){
		setInterval(()=>{
			const peers = this.#libp2p.getPeers().length
			if(peers == 0){
				this.#dialKnownPeers()
			}
		},120*1000)
	}
	
	
	//dial to all known bootstrap peers and DNS
	#dialKnownPeers(){
		setTimeout(()=>{
			this.#dialSavedKnownID()
			setTimeout(()=>{this.#dialUpdateSavedKnownID()},20000)
			setTimeout(()=>{this.#findHybridPeer()},30000)
			setTimeout(()=>{
				const peers = this.#libp2p.getPeers().length
				if(peers == 0){
					this.#dialKnownID()
					setTimeout(()=>{this.#findHybridPeer()},30000)
					setTimeout(()=>{
						const peers = this.#libp2p.getPeers().length
						if(peers == 0){
							this.#dialKnownBootstrap()
							setTimeout(()=>{this.#findHybridPeer()},15000)
							setTimeout(()=>{
								const peers = this.#libp2p.getPeers().length
								if(peers == 0){
									this.#dialKnownDNS()
									setTimeout(()=>{this.#findHybridPeer()},15000)
									setTimeout(()=>{
										const peers = this.#libp2p.getPeers().length
										if(peers == 0){
											this.#dialKnownDNSonly()
											setTimeout(()=>{this.#findHybridPeer()},15000)
										}
									},config.CONFIG_TIMEOUT_DIAL_KNOWN_PEERS)
								}
							},config.CONFIG_TIMEOUT_DIAL_KNOWN_PEERS)
						}
					},config.CONFIG_TIMEOUT_DIAL_KNOWN_PEERS)
				}
			},config.CONFIG_TIMEOUT_DIAL_KNOWN_PEERS)
		},5000)
	}
	
	async #dialSavedKnownID(){

		if(!navigator.onLine)return
		if(!this.#isDialEnabled)return

		let firsttime = true
		for(const target of config.CONFIG_KNOWN_BOOTSTRAP_PEERS_IDS){
			if(this.#dbstoreData.has(target)){
				firsttime = false
				let mddrs = []
				let addrs = []
				const id = target
				const peeraddr = this.#dbstoreData.get(target)
				const peermddr = multiaddr(peeraddr)
				addrs.push(peeraddr)
				mddrs.push(peermddr)
				this.#dialedKnownBootstrap.set(id,addrs)
				if(!this.#isConnected(id)){
					this.#dialMultiaddress(mddrs)
				}
			}
		}
		if(firsttime){
			for(const target of config.CONFIG_KNOWN_BOOTSTRAP_PEERS_IDS){
				const api = config.CONFIG_DELEGATED_API
				const delegatedClient = createDelegatedRoutingV1HttpApiClient(api)
				const peer = await first(delegatedClient.getPeers(peerIdFromString(target)))
				if(!peer)continue
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
	}
	
	async #dialUpdateSavedKnownID(){

		if(!navigator.onLine)return
		if(!this.#isDialEnabled)return

		let firsttime = true
		for(const target of config.CONFIG_KNOWN_BOOTSTRAP_PEERS_IDS){
			if(this.#dbstoreData.has(target)){
				firsttime = false
			}
			if(!this.#connections.has(target) && (this.#dbstoreData.has(target) || firsttime)){
				//console.log('#dialUpdateSavedKnownID()',target)
				const api = config.CONFIG_DELEGATED_API
				const delegatedClient = createDelegatedRoutingV1HttpApiClient(api)
				const peer = await first(delegatedClient.getPeers(peerIdFromString(target)))
				if(!peer){
					if (navigator.onLine) {
						await this.#dbstore.delete(new Key(target))
					}
					continue
				}
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
	}
	
	
	//dial based on known peers ID
	async #dialKnownID(){
		
		if(!navigator.onLine)return
		if(!this.#isDialEnabled)return
		
		//console.log('#dialKnownID()')
		const api = config.CONFIG_DELEGATED_API
		const delegatedClient = createDelegatedRoutingV1HttpApiClient(api)
		const BOOTSTRAP_PEER_IDS = config.CONFIG_KNOWN_BOOTSTRAP_PEERS_IDS
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


	//dial based on known bootsrap peers address using Websocket expected
	#dialKnownBootstrap(){
		
		if(!navigator.onLine)return
		if(!this.#isDialEnabled)return

		const bootstrap = config.CONFIG_KNOWN_BOOTSTRAP_PEERS_ADDRS
		for(const peer of bootstrap){
			const address = peer.Peers[0].Addrs
			const id = peer.Peers[0].ID
			let mddrs = []
			let addrs = []
			for(const addr of address){
				if(!addr.includes('wss'))continue
				const peeraddr = addr+'/p2p/'+id
				const peermddr = multiaddr(peeraddr)
				addrs.push(peeraddr)
				mddrs.push(peermddr)
			}
			
			this.#dialedKnownBootstrap.set(id,addrs)
			this.#isDialWebsocket = true
			if(!this.#isConnected(id)){
				this.#dialMultiaddress(mddrs)
			}
			
		}
	}	
	
	//dial based on known bootstrap DNS
	async #dialKnownDNS(){

		if(!navigator.onLine)return
		if(!this.#isDialEnabled)return

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
			this.#isDialWebsocket = true
			if(!this.#isConnected(id)){
				this.#dialMultiaddress(mddrs)
			}
		}
		
	}
	
	
	//dial based on known bootstrap DNS using DNS resolver only
	async #dialKnownDNSonly(){

		if(!navigator.onLine)return
		if(!this.#isDialEnabled)return

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
	
	
	//dial DNS with webtransport and websocket
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
	
	
	//dial only webtransport multiaddrs
	async #dialWebtransport(multiaddrs){
			const webTransportMadrs = multiaddrs.filter((maddr) => maddr.protoNames().includes('webtransport')&&maddr.protoNames().includes('certhash'))
			  for (const mddr of webTransportMadrs) {
				try {
				  //console.log(`attempting to dial webtransport multiaddr: %o`, mddr.toString())
				  await this.#libp2p.dial(mddr)
				  return // if we succeed dialing the peer, no need to try another address
				} catch (error) {
				  //console.log(`failed to dial webtransport multiaddr: %o`, mddr.toString())
				  mkDebug(error)
				}
			  }
	}
	
	//dial only websocket multiaddrs
	async #dialWebsocket(multiaddrs){
			const webSocketMadrs = multiaddrs.filter((maddr) => maddr.protoNames().includes('wss'))
			  for (const mddr of webSocketMadrs) {
				try {
				  //console.log(`attempting to dial websocket multiaddr: %o`, mddr)
				  await this.#libp2p.dial(mddr)
				  return // if we succeed dialing the peer, no need to try another address
				} catch (error) {
				  //console.log(`failed to dial websocket multiaddr: %o`, mddr)
				  mkDebug(error)
				}
			  }
	}
	
	
	//entry point to webpeerjs
	static async createWebpeer(){

		// all libp2p debug logs
		//localStorage.setItem('debug', 'libp2p:*')
		
		const dbstore = new IDBDatastore(config.CONFIG_DBSTORE_PATH)
		await dbstore.open()
		
		const bootstrapAddrs = []
		
		//let addrs = []
		const getbootstrap = config.CONFIG_KNOWN_BOOTSTRAP_PEERS_ADDRS
		for(const peer of getbootstrap){
			const addrs = peer.Peers[0].Addrs
			const id = peer.Peers[0].ID
			//let mddrs = []
			for(const addr of addrs){
				if(addr.includes('webtransport')&&addr.includes('certhash')){
					bootstrapAddrs.push(addr+'/p2p/'+id)
				}
			}
		}

		let onMetricsFn = () => {}
		const onMetrics = f => (onMetricsFn = f)
		
		let listenaddress = []
		
		if(config.CONFIG_RUN_ON_TRANSIENT_CONNECTION == false){
			listenaddress.push('/webrtc')
		}
		
		const turnurls = atob(config.CONFIG_WEBRTC_TURN_HOST)
		const turnusername = atob(config.CONFIG_WEBRTC_TURN_USER)
		const turncredential = atob(config.CONFIG_WEBRTC_TURN_PWD)

		const turnurlsbackup = atob(config.CONFIG_WEBRTC_TURN_HOST_BACKUP)
		const turnusernamebackup = atob(config.CONFIG_WEBRTC_TURN_USER_BACKUP)
		const turncredentialbackup = atob(config.CONFIG_WEBRTC_TURN_PWD_BACKUP)
		
		const ice = await new Promise((resolve)=>{
			
			let stun = false
			let turn = false
			
			const timeout = setTimeout(()=>{
				let ice = []
				if(stun){
					ice.push(stun)
				}else{
					const backup = {
						urls: config.CONFIG_WEBRTC_STUN_URLS_BACKUP
					}
					ice.push(backup)
				}
				if(turn){
					ice.push(turn)
				}else{
					const backup = 	{
						urls: turnurlsbackup, 
						username: turnusernamebackup, 
						credential: turncredentialbackup
					}
					ice.push(backup)
				}
				resolve(ice)
			},5000)
			
			function check(){
				if(stun && turn){
					let ice = []
					ice.push(stun)
					ice.push(turn)
					clearTimeout(timeout)
					resolve(ice)
				}
			}
			
			//test ice servers
			
			const iceServers = [
				{
					urls: config.CONFIG_WEBRTC_STUN_URLS
				},
				{
					urls: turnurls, 
					username: turnusername, 
					credential: turncredential
				}
			];

			const pc = new RTCPeerConnection({
				iceServers
			});

			pc.onicecandidate = (e) => {
				if (!e.candidate) return;

				//console.log(e.candidate.candidate);

				// stun works
				if(e.candidate.type == "srflx"){
					//console.log('publicip',e.candidate.address);
					stun = 	{
								urls: config.CONFIG_WEBRTC_STUN_URLS
							}
					check()
				}

				// turn works
				if(e.candidate.type == "relay"){
					turn =  {
								urls: turnurls, 
								username: turnusername, 
								credential: turncredential
							}
					check()
				}
			};

			pc.onicecandidateerror = (e) => {
				//console.error(e);
			};

			pc.createDataChannel('webpeerjs');
			pc.createOffer().then(offer => pc.setLocalDescription(offer));
		})
		
		//create libp2p instance
		const libp2p = await createLibp2p({
			addresses: {
				listen: listenaddress,
			},
			transports:[
				webTransport(),
				webSockets(),
				webRTC({
					rtcConfiguration: {
						iceServers: ice,
					},
				}),
				circuitRelayTransport({
					discoverRelays: config.CONFIG_DISCOVER_RELAYS,
					reservationConcurrency: 1,
					maxReservationQueueLength: 3
				}),
			],
			connectionManager: {
				maxConnections: config.CONFIG_MAX_CONNECTIONS,
				minConnections: config.CONFIG_MIN_CONNECTIONS,
				autoDialInterval:60e3,
				autoDialConcurrency:0,
				autoDialMaxQueueLength:0,
				autoDialPriority:1000,
				autoDialDiscoveredPeersDebounce:60e3,
				maxParallelDials: 3,
				dialTimeout: 5e3,
				maxIncomingPendingConnections: 5,
				maxDialQueueLength:10,
				inboundConnectionThreshold:3,
				maxPeerAddrsToDial:2,
				inboundUpgradeTimeout:5e3
			},
			connectionEncryption: [noise()],
			streamMuxers: [
				yamux({
					maxInboundStreams: 100,
					maxOutboundStreams: 100,
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
					topics: config.CONFIG_PUBSUB_PEER_DISCOVERY_WEBPEER,
					listenOnly: false,
				}),
				
			],
			services: {
				pubsub: gossipsub({
					allowPublishToZeroTopicPeers: true,
					msgIdFn: msgIdFnStrictNoSign,
					ignoreDuplicatePublishError: true,
					runOnTransientConnection:config.CONFIG_RUN_ON_TRANSIENT_CONNECTION,
				}),
				identify: identify(),
				identifyPush: identifyPush(),
				aminoDHT: kadDHT({
					protocol: '/ipfs/kad/1.0.0',
					peerInfoMapper: removePrivateAddressesMapper,
					clientMode: false
				}),
				dcutr: dcutr()
			},
			peerStore: {
				persistence: true,
				threshold: 1
			},
			metrics: simpleMetrics({
				onMetrics: (metrics) => {onMetricsFn(metrics)},
				intervalMs: 1000
			})
		})
		
		
		
		//console.log(`Node started with id ${libp2p.peerId.toString()}`)

		//DHT server mode act as bootstrap peer in IPFS network
		await libp2p.services.aminoDHT.setMode("server")
		
		
		//return webpeerjs class
		return new webpeerjs(libp2p,dbstore,onMetrics)
	}
}


//export module
export {webpeerjs}