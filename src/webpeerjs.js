import {
  createDelegatedRoutingV1HttpApiClient
} from '@helia/delegated-routing-v1-http-api-client'
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'
import { createLibp2p } from 'libp2p'
import { IDBBlockstore } from 'blockstore-idb'
import { IDBDatastore } from 'datastore-idb'
import { webTransport } from '@libp2p/webtransport'
//import { webSockets } from '@libp2p/websockets'
//import { webRTC, webRTCDirect } from '@libp2p/webrtc'
import * as config from  './config'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { bootstrap } from '@libp2p/bootstrap'
import { identify } from '@libp2p/identify'
import { multiaddr } from '@multiformats/multiaddr'
import first from 'it-first'
import { peerIdFromString } from '@libp2p/peer-id'

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
			  //console.log('Discovered:', peerId.toString())
			  this.discoveredPeers.set(evt.detail.id.toString(), evt.detail)
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
		console.log('addresses',addresses)
	  })

	}
	
	getPeers(){
		return this.libp2p.getPeers()
	}
	
	static async createWebpeer(){
		
		localStorage.debug = 'ui*,libp2p*,-libp2p:connection-manager*,-*:trace'
		
		const delegatedClient = createDelegatedRoutingV1HttpApiClient('https://delegated-ipfs.dev')
		
		//const { bootstrapAddrs, relayListenAddrs } = await getBootstrapMultiaddrs(delegatedClient)
		
		const blockstore = new IDBBlockstore(config.CONFIG_BLOCKSTORE_PATH)
		await blockstore.open()
		const datastore = new IDBDatastore(config.CONFIG_DATASTORE_PATH)
		await datastore.open()
		const libp2p = await createLibp2p({
			datastore,
			addresses: {
			  listen: [
				//'/webrtc',
				//...relayListenAddrs,
			  ],
			},
			transports:[
				webTransport(),
				//webSockets(),
				  /*webRTC({
					rtcConfiguration: {
					  iceServers: [
						{
						  urls: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478'],
						},
					  ],
					},
				  }),*/
				  //webRTCDirect(),				
				circuitRelayTransport({
					discoverRelays: config.CONFIG_DISCOVER_RELAYS,
				}),
			],
			connectionManager: {
				maxConnections: config.CONFIG_MAX_CONNECTIONS,
				minConnections: config.CONFIG_MIN_CONNECTIONS
			},
			connectionEncryption: [noise()],
			streamMuxers: [yamux()],
			connectionGater: {
			  denyDialMultiaddr: async () => false,
			},
			peerDiscovery: [
			  pubsubPeerDiscovery({
				interval: 10_000,
				topics: [config.CONFIG_PUBSUB_PEER_DISCOVERY],
				listenOnly: false,
			  }),
			  bootstrap({
				list: 
					//bootstrapAddrs,
					config.CONFIG_KNOWN_BOOTSTRAP_ADDRS
			  }),
			],
			services: {
			  pubsub: gossipsub({
				allowPublishToZeroTopicPeers: true,
				msgIdFn: msgIdFnStrictNoSign,
				ignoreDuplicatePublishError: true,
			  }),
			  //delegatedRouting: () => delegatedClient,
			  identify: identify(),
			},
		})
		
		libp2p.services.pubsub.subscribe(config.CONFIG_PUPSUB_TOPIC)
		
		console.log(`Node started with id ${libp2p.peerId.toString()}`)

		// print out listening addresses
		console.log('listening on addresses:')
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