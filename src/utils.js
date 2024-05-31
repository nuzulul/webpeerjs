import * as config from  './config'

import { Peer as PBPeer } from '../node_modules/@libp2p/pubsub-peer-discovery/dist/src/peer.js'

const prefix = config.CONFIG_PREFIX

export const mkErr = msg => new Error(`${prefix}: ${msg}`)

export {PBPeer}

export function uint8ArrayToString(uint8Array){
	const string = new TextDecoder().decode(uint8Array)
	return string
}

export function uint8ArrayFromString(string){
	const uint8Array = new TextEncoder().encode(string)
	return uint8Array
}

export function first(farr){
	return new Promise(async function(myResolve, myReject) {
		for await(const data of farr){
			myResolve(data)
			break
		}
	});	
}