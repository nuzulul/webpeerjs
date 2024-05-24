const prefix = 'webpeerjs'
export const CONFIG_PREFIX = prefix
export const CONFIG_BLOCKSTORE_PATH = prefix+'-blockstore'
export const CONFIG_DATASTORE_PATH = prefix+'-datastore'
export const CONFIG_DBSTORE_PATH = prefix+'-dbstore'
export const CONFIG_MAX_CONNECTIONS = 100
export const CONFIG_MIN_CONNECTIONS = 1
export const CONFIG_DISCOVER_RELAYS = 2
export const CONFIG_PUBSUB_PEER_DISCOVERY = prefix+'-peer-discovery'
export const CONFIG_PUPSUB_TOPIC = prefix+'-room'
export const CONFIG_DELEGATED_API = 'https://delegated-ipfs.dev'
export const CONFIG_DNS_RESOLVER = 'https://dns.google/resolve'
export const CONFIG_KNOWN_BOOTSTRAP_DNS = '_dnsaddr.bootstrap.libp2p.io'

export const CONFIG_KNOWN_BOOTSTRAP_PEERS_ADDRS = [
	{
	  "Peers": [
		{
		  "Addrs": [
			"/ip4/139.178.91.71/udp/4001/quic-v1",
			"/ip6/2604:1380:45e3:6e00::1/tcp/4001",
			"/ip4/139.178.91.71/tcp/4001",
			"/ip4/139.178.91.71/udp/4001/quic-v1/webtransport/certhash/uEiDYGZMqjz8wsz59DHA4iJin4nqTUfuJhq9AeAZlHBrmvg/certhash/uEiBXLv0dkEqbhmcinRbwj8b_3vWs0kWwf1-fiaz5wS-tew",
			"/ip6/2604:1380:45e3:6e00::1/udp/4001/quic-v1/webtransport/certhash/uEiDYGZMqjz8wsz59DHA4iJin4nqTUfuJhq9AeAZlHBrmvg/certhash/uEiBXLv0dkEqbhmcinRbwj8b_3vWs0kWwf1-fiaz5wS-tew",
			"/dnsaddr/bootstrap.libp2p.io",
			"/dns6/sv15.bootstrap.libp2p.io/tcp/443/wss",
			"/ip6/2604:1380:45e3:6e00::1/udp/4001/quic-v1",
			"/ip4/139.178.91.71/tcp/443/tls/sni/sv15.bootstrap.libp2p.io/ws",
			"/ip6/2604:1380:45e3:6e00::1/tcp/443/tls/sni/sv15.bootstrap.libp2p.io/ws",
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
			"/ip4/139.178.65.157/udp/4001/quic-v1",
			"/dns6/ny5.bootstrap.libp2p.io/tcp/443/wss",
			"/ip6/2604:1380:45d2:8100::1/tcp/4001",
			"/dns4/ny5.bootstrap.libp2p.io/tcp/443/wss",
			"/ip4/139.178.65.157/tcp/4001",
			"/ip6/2604:1380:45d2:8100::1/udp/4001/quic-v1"
		  ],
		  "ID": "QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
		  "Schema": "peer"
		}
	  ]
	},
	{
	  "Peers": [
		{
		  "Addrs": [
			"/dns4/am6.bootstrap.libp2p.io/tcp/443/wss",
			"/ip6/2604:1380:4602:5c00::3/udp/4001/quic-v1/webtransport/certhash/uEiD3Q2mfd5EYt6Y2M9rsge_nna4hVyCgUVlfSz3IjAK8ew/certhash/uEiAHt8JR08mlUCCGnN8VpqG9G4sfvdjAd0v5ZM5W1lqntw",
			"/ip6/2604:1380:4602:5c00::3/tcp/4001",
			"/ip4/147.75.87.27/udp/4001/quic-v1",
			"/ip6/2604:1380:4602:5c00::3/udp/4001/quic-v1",
			"/ip4/147.75.87.27/tcp/4001",
			"/dns6/am6.bootstrap.libp2p.io/tcp/443/wss",
			"/ip4/147.75.87.27/udp/4001/quic-v1/webtransport/certhash/uEiD3Q2mfd5EYt6Y2M9rsge_nna4hVyCgUVlfSz3IjAK8ew/certhash/uEiAHt8JR08mlUCCGnN8VpqG9G4sfvdjAd0v5ZM5W1lqntw"
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
			"/ip6/2604:1380:40e1:9c00::1/udp/4001/quic-v1/webtransport/certhash/uEiBENNd9IIPnU1cTGoVATo6cly-O2fQAjKpIyFi0msoJew/certhash/uEiD8N0sSnHOUIsKxz4pDuVqx4szt-huTZWafW_EY19H7MQ",
			"/ip6/2604:1380:40e1:9c00::1/tcp/4001",
			"/dnsaddr/bootstrap.libp2p.io",
			"/ip4/145.40.118.135/udp/4001/quic-v1/webtransport/certhash/uEiBENNd9IIPnU1cTGoVATo6cly-O2fQAjKpIyFi0msoJew/certhash/uEiD8N0sSnHOUIsKxz4pDuVqx4szt-huTZWafW_EY19H7MQ",
			"/ip4/145.40.118.135/udp/4001/quic-v1",
			"/dns4/sg1.bootstrap.libp2p.io/tcp/443/wss",
			"/ip6/2604:1380:40e1:9c00::1/udp/4001/quic-v1",
			"/ip4/145.40.118.135/tcp/4001",
			"/dns6/sg1.bootstrap.libp2p.io/tcp/443/wss",
			"/ip4/145.40.118.135/tcp/443/tls/sni/sg1.bootstrap.libp2p.io/ws",
			"/ip6/2604:1380:40e1:9c00::1/tcp/443/tls/sni/sg1.bootstrap.libp2p.io/ws"
		  ],
		  "ID": "QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
		  "Schema": "peer"
		}
	  ]
	},
	{
	  "Peers": [
		{
		  "Addrs": [
			"/ip4/104.131.131.82/udp/4001/quic-v1/webtransport/certhash/uEiCIMEw_vvBwFLEqWbOj_wx7I90HmfMabSyVZ9Vn5srjPA/certhash/uEiBy22YtYUPU8T3aJ4rL3jC0lLR8MFZZNkFP-rWRxMrqQA",
			"/ip4/104.131.131.82/udp/4001/quic-v1",
			"/ip4/104.131.131.82/tcp/4001",
			"/ip4/104.131.131.82/udp/4001/quic"
		  ],
		  "ID": "QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
		  "Schema": "peer"
		}
	  ]
	},
	{
	  "Peers": [
		{
		  "Addrs": [
			"/ip4/147.28.186.157/udp/9091/quic-v1",
			"/ip4/147.28.186.157/udp/9090/webrtc-direct/certhash/uEiBbC9bbdvraVWDvcvCEdJAWDymmUqiJQ964FuyEq0hELw"
		  ],
		  "ID": "12D3KooWGahRw3ZnM4gAyd9FK75v4Bp5keFYTvkcAwhpEm28wbV3",
		  "Schema": "peer"
		}
	  ]
	},
	{
	  "Peers": [
		{
		  "Addrs": [
			"/ip6/2604:1380:4642:6600::3/udp/9095/quic-v1/webtransport/certhash/uEiCU6MjDlUhqtik_vc8Ps5_MJtGhJKn-XSqvuzn8SJGL9A/certhash/uEiDlk15VyYoXwTaB608Y80ch3OptpMiKFblYdduSVLy2sQ",
			"/ip4/147.28.186.157/udp/9095/quic-v1",
			"/ip6/2604:1380:4642:6600::3/udp/9095/quic-v1",
			"/ip4/147.28.186.157/udp/9095/quic-v1/webtransport/certhash/uEiCU6MjDlUhqtik_vc8Ps5_MJtGhJKn-XSqvuzn8SJGL9A/certhash/uEiDlk15VyYoXwTaB608Y80ch3OptpMiKFblYdduSVLy2sQ"
		  ],
		  "ID": "12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr",
		  "Schema": "peer"
		}
	  ]
	}
]

export const CONFIG_KNOWN_BOOTSTRAP_PEER_IDS = [
	'12D3KooWGahRw3ZnM4gAyd9FK75v4Bp5keFYTvkcAwhpEm28wbV3',
	'12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr',
	'QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
	'QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
	'QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
	'QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
	'QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
	]
