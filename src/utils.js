import * as config from  './config'

import { Peer as PBPeer } from '../node_modules/@libp2p/pubsub-peer-discovery/dist/src/peer.js'

const prefix = config.CONFIG_PREFIX

export const mkErr = msg => new Error(`${prefix}: ${msg}`)

export {PBPeer}