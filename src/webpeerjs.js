import {
  createDelegatedRoutingV1HttpApiClient
} from '@helia/delegated-routing-v1-http-api-client'
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'
import { createLibp2p } from 'libp2p'
import { IDBBlockstore } from 'blockstore-idb'
import { IDBDatastore } from 'datastore-idb'
import { webTransport } from '@libp2p/webtransport'
import { webSockets } from '@libp2p/websockets'
import * as config from  './config'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { identify } from '@libp2p/identify'
import { multiaddr } from '@multiformats/multiaddr'
import first from 'it-first'
import { peerIdFromString } from '@libp2p/peer-id'
import { kadDHT, removePrivateAddressesMapper } from '@libp2p/kad-dht'

class webpeerjs{
	
	libp2p
	helia
	
	status
	id
	discoveredPeers
	
	constructor(helia){
		this.libp2p = helia.libp2p
		
		this.helia = helia
		
		this.status = (function(libp2p) {
			return libp2p.status
		})(this.libp2p);
		
		this.id = this.libp2p.peerId.toString()
		
		this.discoveredPeers = new Map()
		
		console.log('status',this.status)

		this.libp2p.addEventListener("peer:connect", (evt) => {
		  const connection = evt.detail;
		  //console.log(`Connected to ${connection.toString()}`);
		  
		});

		this.libp2p.addEventListener('peer:discovery', (evt) => {
		  // No need to dial, autoDial is on
			  //console.log('Discovered:', evt.detail.id.toString())
			  //console.log('Discovered:', evt.detail.multiaddrs.toString())
			  this.discoveredPeers.set(evt.detail.id.toString(), evt.detail)
			  if(evt.detail.multiaddrs.toString() != ''){
					let mddrs = []
					const multiaddrs = evt.detail.multiaddrs
					for(const addr of multiaddrs){
					  const peeraddr = addr.toString()+'/p2p/'+evt.detail.id.toString()
					  //if (peeraddr.includes('p2p-circuit'))console.log(peeraddr)
					  const peermddr = multiaddr(peeraddr)
					  mddrs.push(peermddr)
					}
					//this.dialWebtransport(mddrs)
			  }
		  })

		// Listen for peers disconnecting
		this.libp2p.addEventListener("peer:disconnect", (evt) => {
		  const connection = evt.detail;
		  //console.log(`Disconnected from ${connection.toCID().toString()}`);
		});

	  this.libp2p.addEventListener('self:peer:update', ({ detail: { peer } }) => {
		const multiaddrs = peer.addresses.map(({ multiaddr }) => multiaddr)
		//console.log(`changed multiaddrs: peer ${peer.id.toString()} multiaddrs: ${multiaddrs}`)
		//console.log(this.libp2p.getMultiaddrs())
		const addresses = []
		peer.addresses.forEach((addr)=>{
			//console.log(addr.multiaddr.toString())
			addresses.push(addr.multiaddr.toString())
		})
		//console.log('addresses',addresses)
		this.ListenAddressChange(addresses)
	  })
	  
	  this.dialKnownPeers()
	  
	  this.watchConnection()

	}

	ListenAddressChange = () => {}
	onListenAddressChange = f => (this.ListenAddressChange = f)
	
	watchConnection(){
		setInterval(()=>{
			const peers = this.libp2p.getPeers().length
			if(peers == 0){
				this.dialKnownPeers()
			}
		},30000)
	}
	
	dialKnownPeers(){
		
	  this.dialKnownBootstrap()
	  
	  setTimeout(()=>{
		  const peers = this.libp2p.getPeers().length
		  if(peers == 0){
			  this.dialKnownID()
			  setTimeout(()=>{
				  const peers = this.libp2p.getPeers().length
				  if(peers == 0){
					  this.dialKnownDNS()
					  setTimeout(()=>{
						  const peers = this.libp2p.getPeers().length
						  if(peers == 0){
							  this.dialKnowsDNSonly()
						  }
					  },5000)
				  }
			  },5000)
		  }
	  },5000)
	}
	
	dialKnownBootstrap(){
		const bootstrap = config.CONFIG_KNOWN_BOOTSTRAP_PEERS_ADDRS
		for(const peer of bootstrap){
			const addrs = peer.Peers[0].Addrs
			const id = peer.Peers[0].ID
			let mddrs = []
			for(const addr of addrs){
				const peeraddr = addr+'/p2p/'+id
				const peermddr = multiaddr(peeraddr)
				mddrs.push(peermddr)
			}
			this.dialWebtransport(mddrs)
		}
	}
	
	async dialKnownID(){
		const delegatedClient = createDelegatedRoutingV1HttpApiClient('https://delegated-ipfs.dev')
		const BOOTSTRAP_PEER_IDS = config.CONFIG_KNOWN_BOOTSTRAP_PEER_IDS
		const peers = await Promise.all(
			BOOTSTRAP_PEER_IDS.map((peerId) => first(delegatedClient.getPeers(peerIdFromString(peerId)))),
		)
		for(const peer of peers){
			const addrs = peer.Addrs
			const id = peer.ID
			let mddrs = []
			for(const addr of addrs){
				const peeraddr = addr.toString()+'/p2p/'+id.toString()
				const peermddr = multiaddr(peeraddr)
				mddrs.push(peermddr)
			}
			this.dialWebtransport(mddrs)
		}
	}
	
	async dialKnownDNS(){
		const response = await fetch('https://dns.google/resolve?name=_dnsaddr.bootstrap.libp2p.io&type=txt')
		const json = await response.json()
		const dns = json.Answer
		const BOOTSTRAP_PEER_IDS = []
		for(const dnsaddr of dns){
			const id = dnsaddr.data.split('/').pop()
			BOOTSTRAP_PEER_IDS.push(id)
		}
		const delegatedClient = createDelegatedRoutingV1HttpApiClient('https://delegated-ipfs.dev')
		const peers = await Promise.all(
			BOOTSTRAP_PEER_IDS.map((peerId) => first(delegatedClient.getPeers(peerIdFromString(peerId)))),
		)
		for(const peer of peers){
			const addrs = peer.Addrs
			const id = peer.ID
			let mddrs = []
			for(const addr of addrs){
				const peeraddr = addr.toString()+'/p2p/'+id.toString()
				const peermddr = multiaddr(peeraddr)
				mddrs.push(peermddr)
			}
			this.dialWebtransport(mddrs)
		}
		
	}
	
	async dialKnowsDNSonly(){
		const response = await fetch('https://dns.google/resolve?name=_dnsaddr.bootstrap.libp2p.io&type=txt')
		const json = await response.json()
		const dns = json.Answer
		
		for(const dnsitem of dns){
			const arr = dnsitem.data.split('/')
			const id = arr.pop()
			const dnsaddr = '_dnsaddr.'+arr[2]
			this.dialDNSWebsocketWebtransport(dnsaddr)
		}
	}
	
	async dialDNSWebsocketWebtransport(dnsaddr){
		const response = await fetch('https://dns.google/resolve?name='+dnsaddr+'&type=txt')
		const json = await response.json()
		const dns = json.Answer
		let mddrs = []
		for(const dnsitem of dns){
			const arr = dnsitem.data.split('=')
			const dnsaddr = arr[1]
			const maddr = multiaddr(dnsaddr)
			mddrs.push(maddr)
		}
		this.dialWebtransport(mddrs)
		this.dialWebsocket(mddrs)
	}
	
	async dialWebtransport(multiaddrs){
			const webTransportMadrs = multiaddrs.filter((maddr) => maddr.protoNames().includes('webtransport')&&maddr.protoNames().includes('certhash'))
			  for (const addr of webTransportMadrs) {
				try {
				  //console.log(`attempting to dial webtransport multiaddr: %o`, addr)
				  await this.libp2p.dial(addr)
				  return // if we succeed dialing the peer, no need to try another address
				} catch (error) {
				  //console.log(`failed to dial webtransport multiaddr: %o`, addr)
				}
			  }
	}

	async dialWebsocket(multiaddrs){
			const webSocketMadrs = multiaddrs.filter((maddr) => maddr.protoNames().includes('wss'))
			  for (const addr of webSocketMadrs) {
				try {
				  //console.log(`attempting to dial websocket multiaddr: %o`, addr)
				  await this.libp2p.dial(addr)
				  return // if we succeed dialing the peer, no need to try another address
				} catch (error) {
				  //console.log(`failed to dial websocket multiaddr: %o`, addr)
				}
			  }
	}
	
	getPeers(){
		return this.libp2p.getPeers()
	}
	
	static async createWebpeer(){
		
		localStorage.debug = 'ui*,libp2p*,-libp2p:connection-manager*,-*:trace'
		
		const delegatedClient = createDelegatedRoutingV1HttpApiClient('https://delegated-ipfs.dev')
		
		//const { bootstrapAddrs, relayListenAddrs } = await getBootstrapMultiaddrs(delegatedClient)
		
		const blockstore = new IDBBlockstore(config.CONFIG_BLOCKSTORE_PATH)
		await blockstore.destroy()
		await blockstore.open()
		const datastore = new IDBDatastore(config.CONFIG_DATASTORE_PATH)
		await datastore.destroy()
		await datastore.open()
		const libp2p = await createLibp2p({
			datastore,
			addresses: {
			  listen: [
			  ],
			},
			transports:[
				webTransport(),		
				webSockets(),
				circuitRelayTransport({
					discoverRelays: config.CONFIG_DISCOVER_RELAYS,
				}),
			],
			connectionManager: {
				maxConnections: config.CONFIG_MAX_CONNECTIONS,
				minConnections: config.CONFIG_MIN_CONNECTIONS,
			  maxParallelDials: 150, // 150 total parallel multiaddr dials
			  maxDialsPerPeer: 4, // Allow 4 multiaddrs to be dialed per peer in parallel
			  dialTimeout: 10e3, // 10 second dial timeout per peer dial
			  autoDial: false
			},
			connectionEncryption: [noise()],
			streamMuxers: [yamux()],
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
					//console.log("multiaddrString", multiaddrString);
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
				topics: [config.CONFIG_PUBSUB_PEER_DISCOVERY],
				listenOnly: false,
			  }),
			],
			services: {
				pubsub: gossipsub({
					allowPublishToZeroTopicPeers: true,
					msgIdFn: msgIdFnStrictNoSign,
					ignoreDuplicatePublishError: true,
				}),
			  //delegatedRouting: () => delegatedClient,
				identify: identify({
				  //protocolPrefix: 'config.CONFIG_PREFIX'
				}),
				aminoDHT: kadDHT({
				  protocol: '/ipfs/kad/1.0.0',
				  peerInfoMapper: removePrivateAddressesMapper,
				  clientMode: false
				})
			},
			  peerStore: {
				persistence: true,
				threshold: 1
			  },
			  config: {
				dht: {                        // The DHT options (and defaults) can be found in its documentation
				  kBucketSize: 20,
				  enabled: true,
				  randomWalk: {
					enabled: true,            // Allows to disable discovery (enabled by default)
					interval: 300e3,
					timeout: 10e3
				  }
				}
			  }
		})
		
		libp2p.services.pubsub.subscribe(config.CONFIG_PUPSUB_TOPIC)
		
		console.log(`Node started with id ${libp2p.peerId.toString()}`)

		// print out listening addresses
		//console.log('listening on addresses:')
		libp2p.getMultiaddrs().forEach((addr) => {
		  //console.log(addr.toString())
		})

	  /*libp2p.addEventListener('self:peer:update', ({ detail: { peer } }) => {
		const multiaddrs = peer.addresses.map(({ multiaddr }) => multiaddr)
		console.log(`changed multiaddrs: peer ${peer.id.toString()} multiaddrs: ${multiaddrs}`)
	  })*/
		
		//const addr = '/ip4/139.178.91.71/udp/4001/quic-v1/webtransport/certhash/uEiDYGZMqjz8wsz59DHA4iJin4nqTUfuJhq9AeAZlHBrmvg/certhash/uEiBXLv0dkEqbhmcinRbwj8b_3vWs0kWwf1-fiaz5wS-tew'
		
		//await libp2p.dial(multiaddr(addr))

		const helia = await createHelia({
			datastore,
			blockstore,
			libp2p
		})
		
		return new webpeerjs(helia)
	}
}

async function getBootstrapMultiaddrs(client)
{
  const BOOTSTRAP_PEER_IDS = config.CONFIG_BOOTSTRAP_PEER_IDS
  const peers = await Promise.all(
    BOOTSTRAP_PEER_IDS.map((peerId) => first(client.getPeers(peerIdFromString(peerId)))),
  )

  const bootstrapAddrs = []
  const relayListenAddrs = []
  for (const p of peers) {
    if (p && p.Addrs.length > 0) {
      for (const maddr of p.Addrs) {
        const protos = maddr.protoNames()
        if (
          (
			protos.includes('webtransport') 
			//|| protos.includes('webrtc-direct')
		  ) 
		  && protos.includes('certhash')
        ) {
          if (maddr.nodeAddress().address === '127.0.0.1') continue // skip loopback
          bootstrapAddrs.push(maddr.toString())
          relayListenAddrs.push(getRelayListenAddr(maddr, p.ID))
        }
      }
    }
  }
  console.log('bootstrapAddrs',bootstrapAddrs)
  console.log('relayListenAddrs',relayListenAddrs)
  return { bootstrapAddrs, relayListenAddrs }
}

const getRelayListenAddr = (maddr, peer) =>
  `${maddr.toString()}/p2p/${peer.toString()}/p2p-circuit`

async function msgIdFnStrictNoSign(msg){
  var enc = new TextEncoder()

  const signedMessage = msg
  const encodedSeqNum = enc.encode(signedMessage.sequenceNumber.toString())
  return await sha256.encode(encodedSeqNum)
}

export default webpeerjs