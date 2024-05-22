const prefix = 'webpeerjs'
export const CONFIG_BLOCKSTORE_PATH = prefix+'-blockstore'
export const CONFIG_DATASTORE_PATH = prefix+'-datastore'
export const CONFIG_MAX_CONNECTIONS = 100
export const CONFIG_MIN_CONNECTIONS = 50
export const CONFIG_DISCOVER_RELAYS = 2
export const CONFIG_PUBSUB_PEER_DISCOVERY = prefix+'-peer-discovery'
export const CONFIG_PUPSUB_TOPIC = prefix+'-room'
export const CONFIG_KNOWN_BOOTSTRAP_ADDRS = [
          //'/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
          //'/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
          //'/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
          //'/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
		  
		  '/ip4/139.178.91.71/udp/4001/quic-v1/webtransport/certhash/uEiDYGZMqjz8wsz59DHA4iJin4nqTUfuJhq9AeAZlHBrmvg/certhash/uEiBXLv0dkEqbhmcinRbwj8b_3vWs0kWwf1-fiaz5wS-tew',
		  
		  //12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr
		  '/ip4/147.28.186.157/udp/9095/quic-v1/webtransport/certhash/uEiCU6MjDlUhqtik_vc8Ps5_MJtGhJKn-XSqvuzn8SJGL9A/certhash/uEiDlk15VyYoXwTaB608Y80ch3OptpMiKFblYdduSVLy2sQ',
		  //12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr
		  //'/ip6/2604:1380:4642:6600::3/udp/9095/quic-v1/webtransport/certhash/uEiCU6MjDlUhqtik_vc8Ps5_MJtGhJKn-XSqvuzn8SJGL9A/certhash/uEiDlk15VyYoXwTaB608Y80ch3OptpMiKFblYdduSVLy2sQ'
		 
        ]
		
export const CONFIG_LISTEN_ADDRS = [
    "/ip6/2604:1380:4642:6600::3/udp/9095/quic-v1/webtransport/certhash/uEiCU6MjDlUhqtik_vc8Ps5_MJtGhJKn-XSqvuzn8SJGL9A/certhash/uEiDlk15VyYoXwTaB608Y80ch3OptpMiKFblYdduSVLy2sQ/p2p/12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr/p2p-circuit",
    "/ip4/147.28.186.157/udp/9095/quic-v1/webtransport/certhash/uEiCU6MjDlUhqtik_vc8Ps5_MJtGhJKn-XSqvuzn8SJGL9A/certhash/uEiDlk15VyYoXwTaB608Y80ch3OptpMiKFblYdduSVLy2sQ/p2p/12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr/p2p-circuit",
    "/ip4/147.28.186.157/udp/9090/webrtc-direct/certhash/uEiBbC9bbdvraVWDvcvCEdJAWDymmUqiJQ964FuyEq0hELw/p2p/12D3KooWGahRw3ZnM4gAyd9FK75v4Bp5keFYTvkcAwhpEm28wbV3/p2p-circuit"
]

export const CONFIG_BOOTSTRAP_PEER_IDS = [
	'12D3KooWGahRw3ZnM4gAyd9FK75v4Bp5keFYTvkcAwhpEm28wbV3',
	'12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr'
	]