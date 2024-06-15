const prefix = 'webpeerjs'
export const CONFIG_PREFIX = prefix
export const CONFIG_BLOCKSTORE_PATH = prefix+'-blockstore'
export const CONFIG_DATASTORE_PATH = prefix+'-datastore'
export const CONFIG_DBSTORE_PATH = prefix+'-dbstore'
export const CONFIG_MAX_CONNECTIONS = 100
export const CONFIG_MIN_CONNECTIONS = 0
export const CONFIG_DISCOVER_RELAYS = 1
export const CONFIG_PEER_DISCOVERY_UNIVERSAL_CONNECTIVITY = 'universal-connectivity-browser-peer-discovery'
export const CONFIG_PEER_DISCOVERY_GLOBAL = '_peer-discovery._p2p._pubsub'
export const CONFIG_PEER_DISCOVERY_WEBPEERJS= prefix+'-peer-discovery'
export const CONFIG_PUBSUB_PEER_DISCOVERY = [CONFIG_PEER_DISCOVERY_GLOBAL, CONFIG_PEER_DISCOVERY_UNIVERSAL_CONNECTIVITY, CONFIG_PEER_DISCOVERY_WEBPEERJS]
export const CONFIG_PUPSUB_TOPIC = prefix+'-room'
export const CONFIG_DELEGATED_API = 'https://delegated-ipfs.dev'
export const CONFIG_DNS_RESOLVER = 'https://dns.google/resolve'
export const CONFIG_KNOWN_BOOTSTRAP_DNS = '_dnsaddr.bootstrap.libp2p.io'
export const CONFIG_JOIN_ROOM_VERSION = 1

export const CONFIG_KNOWN_BOOTSTRAP_PEERS_ADDRS = [
]

export const CONFIG_KNOWN_BOOTSTRAP_PEER_IDS = [
	'QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
	'QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
	'QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
	'QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
	'12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr',
	'12D3KooWPEDBmt7vm6FNNYuqaA4n2qMUZ6wPK5NcRc8t6KpqgRkV',
	'12D3KooWSHbugDEQeWm2LjtRRMpNgLu6oZ8zkX8XcTwYMAewVekP',
	'12D3KooWASoxFpwwy8JDdu4Tm57mhESsnbFPogam9VVmhR95FGXr',
	'12D3KooWHh98YpAkJsn3ULjMjK1n9QVkXmi8Sb3gTDMatHxCmDP5',
	'12D3KooWS79EhkPU7ESUwgG4vyHHzW9FDNZLoWVth9b5N5NSrvaj',
	'12D3KooWBbkCD5MpJhMc1mfPAVGEyVkQnyxPKGS7AHwDqQM2JUsk',
	'12D3KooWKLdecs31Zmo2pLBjR9HY2vWo3VwM4eBm21Czeucbe6FL',
	'12D3KooWBdF3g6vSJFRPoZQo7BNnkNzaWb59gpyaVzsgtNTVeu8H'
	]

export const CONFIG_KNOWN_BOOTSTRAP_PUBLIC = [
	'12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr'
]