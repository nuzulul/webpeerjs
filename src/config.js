const prefix = 'webpeerjs'
export const CONFIG_PREFIX = prefix
export const CONFIG_BLOCKSTORE_PATH = prefix+'-blockstore'
export const CONFIG_DATASTORE_PATH = prefix+'-datastore'
export const CONFIG_DBSTORE_PATH = prefix+'-dbstore'
export const CONFIG_MAX_CONNECTIONS = 50
export const CONFIG_MIN_CONNECTIONS = 0
export const CONFIG_DISCOVER_RELAYS = 1
export const CONFIG_PEER_DISCOVERY_UNIVERSAL_CONNECTIVITY = 'universal-connectivity-browser-peer-discovery'
export const CONFIG_PUBSUB_PEER_DISCOVERY = ['_peer-discovery._p2p._pubsub',CONFIG_PEER_DISCOVERY_UNIVERSAL_CONNECTIVITY,prefix+'-peer-discovery']
export const CONFIG_PUPSUB_TOPIC = prefix+'-room'
export const CONFIG_DELEGATED_API = 'https://delegated-ipfs.dev'
export const CONFIG_DNS_RESOLVER = 'https://dns.google/resolve'
export const CONFIG_KNOWN_BOOTSTRAP_DNS = '_dnsaddr.bootstrap.libp2p.io'
export const CONFIG_JOIN_ROOM_VERSION = 1

export const CONFIG_KNOWN_BOOTSTRAP_PEERS_ADDRS = [
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
	},
	{
		"Peers": [
			{
				"Addrs": [
					"/ip6/2607:f2f8:a880:0:5054:ff:fe9f:4913/udp/4001/quic-v1/webtransport/certhash/uEiD84ZvAnGWTQx_WlOAqreebO036a5RRB5zfJBo9QJfDBA/certhash/uEiAOMkIVxeNye76-f5ADnLCSNqNlnhOYdkwyRlqLFbhIkQ",
					"/ip6/2607:f2f8:a880::70/udp/4001/quic-v1/webtransport/certhash/uEiD84ZvAnGWTQx_WlOAqreebO036a5RRB5zfJBo9QJfDBA/certhash/uEiAOMkIVxeNye76-f5ADnLCSNqNlnhOYdkwyRlqLFbhIkQ",
					"/ip6/2607:f2f8:a880:0:5054:ff:fe9f:4913/tcp/4001",
					"/ip6/2607:f2f8:a880:0:5054:ff:fe9f:4913/udp/4001/quic-v1",
					"/ip4/174.136.97.180/udp/4001/quic-v1/webtransport/certhash/uEiD84ZvAnGWTQx_WlOAqreebO036a5RRB5zfJBo9QJfDBA/certhash/uEiAOMkIVxeNye76-f5ADnLCSNqNlnhOYdkwyRlqLFbhIkQ",
					"/ip4/174.136.97.180/udp/4001/quic-v1",
					"/ip6/2607:f2f8:a880::70/udp/4001/quic-v1",
					"/ip4/174.136.97.180/tcp/4001"
				],
				"ID": "12D3KooWPEDBmt7vm6FNNYuqaA4n2qMUZ6wPK5NcRc8t6KpqgRkV",
				"Schema": "peer"
			}
		]
	},
	{
		"Peers": [
			{
				"Addrs": [
					"/ip4/174.136.97.179/udp/4001/quic-v1",
					"/ip6/2607:f2f8:a880::50/udp/4002/quic-v1/webtransport/certhash/uEiBF7KOka9hhb2IjhUd-OkfgTFOf-VpgV7fwvMkKOkMrdQ/certhash/uEiDxVhDwzFlnorujU_rjTnO_TTLRMlXxzPLEgaG-1xOPkA",
					"/ip4/174.136.97.179/udp/4001/quic-v1/webtransport/certhash/uEiBF7KOka9hhb2IjhUd-OkfgTFOf-VpgV7fwvMkKOkMrdQ/certhash/uEiDxVhDwzFlnorujU_rjTnO_TTLRMlXxzPLEgaG-1xOPkA",
					"/ip6/2607:f2f8:a880::50/udp/4001/quic-v1",
					"/ip4/174.136.97.179/udp/4002/quic-v1/webtransport/certhash/uEiBF7KOka9hhb2IjhUd-OkfgTFOf-VpgV7fwvMkKOkMrdQ/certhash/uEiDxVhDwzFlnorujU_rjTnO_TTLRMlXxzPLEgaG-1xOPkA",
					"/ip6/2607:f2f8:a880::50/tcp/4001",
					"/ip6/2607:f2f8:a880::50/udp/4001/quic-v1/webtransport/certhash/uEiBF7KOka9hhb2IjhUd-OkfgTFOf-VpgV7fwvMkKOkMrdQ/certhash/uEiDxVhDwzFlnorujU_rjTnO_TTLRMlXxzPLEgaG-1xOPkA",
					"/ip4/174.136.97.179/tcp/4001"
				],
				"ID": "12D3KooWSHbugDEQeWm2LjtRRMpNgLu6oZ8zkX8XcTwYMAewVekP",
				"Schema": "peer"
			}
		]
	},
	{
		"Peers": [
			{
				"Addrs": [
					"/ip6/2a03:4000:46:26e::c17/udp/443/quic-v1/webtransport/certhash/uEiAortGu7HNi8-pV9onPFkTwykrnWuJEqYf7zbQVE1FEtg/certhash/uEiB5Z8j3pdTJU_TDYoJ-GgUQSaXOmvKIGmASL9s-p3VHQA",
					"/ip4/45.83.104.156/udp/443/quic-v1",
					"/ip4/45.83.104.156/udp/443/quic-v1/webtransport/certhash/uEiAortGu7HNi8-pV9onPFkTwykrnWuJEqYf7zbQVE1FEtg/certhash/uEiB5Z8j3pdTJU_TDYoJ-GgUQSaXOmvKIGmASL9s-p3VHQA",
					"/ip6/2a03:4000:46:26e::c17/tcp/443",
					"/ip6/2a03:4000:46:26e::c17/udp/443/quic-v1",
					"/ip4/45.83.104.156/tcp/443"
				],
				"ID": "12D3KooWASoxFpwwy8JDdu4Tm57mhESsnbFPogam9VVmhR95FGXr",
				"Schema": "peer"
			}
		]
	},
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
					"/ip4/16.170.214.173/udp/4001/quic-v1/webtransport/certhash/uEiAKAeeOxU7ExDc81y7d53D96nFaRmmXwSFj0429Ij9T9A/certhash/uEiB4ttGGuaUzqF84q5RFhUTVArF4mb9t_UN_kcsfd4qYEQ",
					"/ip4/16.170.214.173/tcp/4001",
					"/ip4/16.170.214.173/udp/4001/quic-v1"
				],
				"ID": "12D3KooWHh98YpAkJsn3ULjMjK1n9QVkXmi8Sb3gTDMatHxCmDP5",
				"Schema": "peer"
			}
		]
	},
	{
		"Peers": [
			{
				"Addrs": [
					"/ip4/18.119.248.24/udp/4001/quic-v1",
					"/ip4/18.119.248.24/tcp/4001",
					"/ip4/18.119.248.24/udp/4001/quic-v1/webtransport/certhash/uEiDwG2YnjoUpoKqmUMX-aYJeLi1UNEsqa8EFhpHFUVs0AQ/certhash/uEiCqy6-Pk3S2iYS0puQ0UhtTZ1s_nw-sIsoB-bX0Le6lFA"
				],
				"ID": "12D3KooWS79EhkPU7ESUwgG4vyHHzW9FDNZLoWVth9b5N5NSrvaj",
				"Schema": "peer"
			}
		]
	},
	{
		"Peers": [
			{
				"Addrs": [
					"/ip4/83.173.236.99/udp/4001/quic-v1/webtransport/certhash/uEiD8mhYDW_6kgJAb07RlZnA-YSScG38df5wb9IxFtZmQwQ/certhash/uEiACG9e-sG_ild6y5t-jvb_dfsNi_gPgZ7nn7Qa5ctT-Wg",
					"/ip6/2a02:121e:21e:1:546f:18ff:fea8:8e/tcp/4001",
					"/ip4/83.173.236.99/tcp/10201",
					"/dns4/ipfs-ws.neaweb.ch/tcp/443/wss",
					"/ip4/89.251.251.195/udp/4001/quic-v1",
					"/ip4/89.251.251.195/udp/4001/quic-v1/webtransport/certhash/uEiD8mhYDW_6kgJAb07RlZnA-YSScG38df5wb9IxFtZmQwQ/certhash/uEiACG9e-sG_ild6y5t-jvb_dfsNi_gPgZ7nn7Qa5ctT-Wg",
					"/ip6/2a02:121e:21e:1:546f:18ff:fea8:8e/udp/4001/quic-v1",
					"/ip4/89.251.251.195/tcp/4001/quic-v1/webtransport",
					"/ip6/2a02:121e:21e:1:546f:18ff:fea8:8e/tcp/4011/ws",
					"/ip4/89.251.251.195/tcp/4001",
					"/dns4/ipfs-ws.neaweb.tech/tcp/443/wss",
					"/ip4/89.251.251.195/tcp/4001/quic-v1",
					"/ip4/83.173.236.99/tcp/4001",
					"/ip6/2a02:121e:21e:1:546f:18ff:fea8:8e/udp/4001/quic-v1/webtransport/certhash/uEiD8mhYDW_6kgJAb07RlZnA-YSScG38df5wb9IxFtZmQwQ/certhash/uEiACG9e-sG_ild6y5t-jvb_dfsNi_gPgZ7nn7Qa5ctT-Wg",
					"/ip4/83.173.236.99/udp/4001/quic-v1",
					"/ip4/83.173.236.99/udp/19707/quic-v1",
					"/ip4/83.173.236.99/udp/19707/quic-v1/webtransport/certhash/uEiD8mhYDW_6kgJAb07RlZnA-YSScG38df5wb9IxFtZmQwQ/certhash/uEiACG9e-sG_ild6y5t-jvb_dfsNi_gPgZ7nn7Qa5ctT-Wg"
				],
				"ID": "12D3KooWBbkCD5MpJhMc1mfPAVGEyVkQnyxPKGS7AHwDqQM2JUsk",
				"Schema": "peer"
			}
		]
	},
	{
		"Peers": [
			{
				"Addrs": [
					"/ip4/89.58.11.155/udp/4001/quic-v1/webtransport/certhash/uEiDDgTBtcIstrvU4MRSfcD7tYDIsQrnGAxW6Oh5AoLm4Ig/certhash/uEiAXHXsg1wBb-sPvpBw8BVpRFxso1milPa801TxjPNYQ3w",
					"/ip4/89.58.11.155/udp/4001/quic",
					"/ip6/64:ff9b::593a:b9b/udp/4001/quic-v1/webtransport/certhash/uEiDDgTBtcIstrvU4MRSfcD7tYDIsQrnGAxW6Oh5AoLm4Ig/certhash/uEiAXHXsg1wBb-sPvpBw8BVpRFxso1milPa801TxjPNYQ3w",
					"/ip6/64:ff9b::593a:b9b/udp/4001/quic-v1",
					"/ip4/89.58.11.155/udp/4001/quic-v1",
					"/ip4/89.58.11.155/tcp/4001"
				],
				"ID": "12D3KooWKLdecs31Zmo2pLBjR9HY2vWo3VwM4eBm21Czeucbe6FL",
				"Schema": "peer"
			}
		]
	},	

]

export const CONFIG_KNOWN_BOOTSTRAP_PEER_IDS = [
	'12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr',
	'12D3KooWGahRw3ZnM4gAyd9FK75v4Bp5keFYTvkcAwhpEm28wbV3',
	'12D3KooWPEDBmt7vm6FNNYuqaA4n2qMUZ6wPK5NcRc8t6KpqgRkV',
	'12D3KooWSHbugDEQeWm2LjtRRMpNgLu6oZ8zkX8XcTwYMAewVekP',
	'12D3KooWASoxFpwwy8JDdu4Tm57mhESsnbFPogam9VVmhR95FGXr',
	'QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
	'QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
	'QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
	'QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
	'QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
	'12D3KooWHh98YpAkJsn3ULjMjK1n9QVkXmi8Sb3gTDMatHxCmDP5',
	'12D3KooWS79EhkPU7ESUwgG4vyHHzW9FDNZLoWVth9b5N5NSrvaj',
	'12D3KooWBbkCD5MpJhMc1mfPAVGEyVkQnyxPKGS7AHwDqQM2JUsk',
	'12D3KooWKLdecs31Zmo2pLBjR9HY2vWo3VwM4eBm21Czeucbe6FL',
	]
