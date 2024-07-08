//! WebPEER.js -- https://github.com/nuzulul/webpeerjs
const prefix = 'webpeerjs'
export const CONFIG_PREFIX = prefix
export const CONFIG_PROTOCOL = '/'+prefix+'/1.0.0'
export const CONFIG_BLOCKSTORE_PATH = prefix+'-blockstore'
export const CONFIG_DATASTORE_PATH = prefix+'-datastore'
export const CONFIG_DBSTORE_PATH = prefix+'-dbstore'
export const CONFIG_MAX_CONNECTIONS = 100
export const CONFIG_MIN_CONNECTIONS = 0
export const CONFIG_DISCOVER_RELAYS = 1
export const CONFIG_PEER_DISCOVERY_UNIVERSAL_CONNECTIVITY = 'universal-connectivity-browser-peer-discovery'
export const CONFIG_PEER_DISCOVERY_GLOBAL = '_peer-discovery._p2p._pubsub'
export const CONFIG_PEER_DISCOVERY_WEBPEERJS= prefix+'-peer-discovery'
export const CONFIG_PUBSUB_PEER_DISCOVERY_HYBRID = [CONFIG_PEER_DISCOVERY_UNIVERSAL_CONNECTIVITY]
export const CONFIG_PUBSUB_PEER_DISCOVERY_WEBPEER = [CONFIG_PEER_DISCOVERY_GLOBAL, CONFIG_PEER_DISCOVERY_WEBPEERJS]
export const CONFIG_PUPSUB_PEER_DATA = ['_'+prefix+'-peer-data_']
export const CONFIG_PUPSUB_TOPIC = prefix+'-room'
export const CONFIG_DELEGATED_API = 'https://delegated-ipfs.dev'
export const CONFIG_DNS_RESOLVER = 'https://dns.google/resolve'
export const CONFIG_KNOWN_BOOTSTRAP_DNS = '_dnsaddr.bootstrap.libp2p.io'
export const CONFIG_JOIN_ROOM_VERSION = 1
export const CONFIG_TIMEOUT_DIAL_KNOWN_PEERS = 15000
export const CONFIG_RUN_ON_TRANSIENT_CONNECTION = true

// this list comes from https://github.com/ipfs/kubo/blob/196887cbe5fbcd41243c1dfb0db681a1cc2914ff/config/bootstrap_peers.go
export const CONFIG_KNOWN_DEFAULT_BOOTSTRAP_ADDRESSES = [
	"/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
	"/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
	"/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
	"/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
	"/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
	"/ip4/104.131.131.82/udp/4001/quic/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ"
]

export const CONFIG_KNOWN_BOOTSTRAP_PUBLIC_IDS = [
	'QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
	'QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
	'QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
	'QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
	]

export const CONFIG_KNOWN_BOOTSTRAP_HYBRID_IDS = [
	'12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr'
]

export const CONFIG_KNOWN_BOOTSTRAP_PEERS_IDS = CONFIG_KNOWN_BOOTSTRAP_PUBLIC_IDS.concat(CONFIG_KNOWN_BOOTSTRAP_HYBRID_IDS)

export const CONFIG_KNOWN_BOOTSTRAP_PEERS_ADDRS = [
{
    "Peers": [
        {
            "Addrs": [
                "/dns6/sv15.bootstrap.libp2p.io/tcp/443/wss",
                "/dns4/sv15.bootstrap.libp2p.io/tcp/443/wss"
            ],
            "ID": "QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
            "Schema": "peer"
        }
    ]
},
{
    "Peers": [
        {
            "Addrs": [
                "/dns4/am6.bootstrap.libp2p.io/tcp/443/wss",
                "/dns6/am6.bootstrap.libp2p.io/tcp/443/wss"
            ],
            "ID": "QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
            "Schema": "peer"
        }
    ]
},
{
    "Peers": [
        {
            "Addrs": [
                "/dns6/sg1.bootstrap.libp2p.io/tcp/443/wss",
                "/dns4/sg1.bootstrap.libp2p.io/tcp/443/wss"
            ],
            "ID": "QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
            "Schema": "peer"
        }
    ]
}
]