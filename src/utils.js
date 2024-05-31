import * as config from  './config'

import { Peer as PBPeer } from '#/pubsub-peer-discovery/peer.js'

import { Key } from 'interface-datastore'

import { sha256 } from 'multiformats/hashes/sha2'



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

export {Key}

//Add id to pupsub message
export async function msgIdFnStrictNoSign(msg){
  var enc = new TextEncoder()
  const signedMessage = msg
  const encodedSeqNum = enc.encode(signedMessage.sequenceNumber.toString())
  return await sha256.encode(encodedSeqNum)
}