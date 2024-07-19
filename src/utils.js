//! WebPEER.js -- https://github.com/nuzulul/webpeerjs

import * as config from  './config'
import { Peer as PBPeer } from './peer'
import { Key } from 'interface-datastore'
import { sha256 } from 'multiformats/hashes/sha2'
import { multiaddr } from '@multiformats/multiaddr'
import { pipe } from 'it-pipe'
import { lpStream } from 'it-length-prefixed-stream'
import * as lp from 'it-length-prefixed'
import map from 'it-map'

export { Key }

export { multiaddr }

export { pipe }

export { lpStream }

export { lp }

export { map }


const prefix = config.CONFIG_PREFIX

export const mkErr = msg => new Error(`${prefix}: ${msg}`)

export function mkDebug(msg){
	if(config.CONFIG_DEBUG_ENABLED)console.debug(msg)
	return
}

export {PBPeer}

export function uint8ArrayToString(uint8Array){
	const string = new TextDecoder().decode(uint8Array)
	return string
}

export function uint8ArrayFromString(string){
	const uint8Array = new TextEncoder().encode(string)
	return uint8Array
}

export async function first(farr){
		for await(const data of farr){
			return data
			//break
		}
}

//browser detector
//this code comes from https://stackoverflow.com/a/9851769

// Opera 8.0+
const isOpera = (!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Firefox 1.0+
const isFirefox = typeof InstallTrigger !== 'undefined';
// Safari 3.0+ "[object HTMLElementConstructor]" 
const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));
// Internet Explorer 6-11
//const isIE = /*@cc_on!@*/false || !!document.documentMode;
// Edge 20+
//const isEdge = !isIE && !!window.StyleMedia;
// Chrome 1 - 79
const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
// Edge (based on chromium) detection
const isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);
// Blink engine detection
const isBlink = (isChrome || isOpera) && !!window.CSS;

export const browser = {isOpera,isFirefox,isSafari,isChrome,isEdgeChromium,isBlink}

//Add id to pupsub message
export async function msgIdFnStrictNoSign(msg){
  var enc = new TextEncoder()
  const signedMessage = msg
  const encodedSeqNum = enc.encode(signedMessage.sequenceNumber.toString())
  return await sha256.encode(encodedSeqNum)
}

let totals = {
    readyErrored: 0,
    noiseErrored: 0,
    upgradeErrored: 0,
    readyTimedout: 0,
    noiseTimedout: 0,
    success: 0
}

let stats = {
    pending: 0,
    open: 0,

    ready_error: 0,
    noise_error: 0,
    upgrade_error: 0,

    ready_timeout: 0,
    noise_timeout: 0,

    close: 0,
    abort: 0,
    remote_close: 0,
}

let lastStats = {
    pending: 0,
    ready_error: 0,
    noise_error: 0,
    upgrade_error: 0,
    close: 0,
    remote_close: 0,
    ready: 0,
    abort: 0,
    ready_timeout: 0,
    noise_timeout: 0,
    open: 0
}

let fail = 0
let lastfail = 0
let isDialEnabled = true
let lastfailtreshold = 0
let isAutoDialEnabled = true
let lastfailtresholdauto = 0


export function metrics(data){
	
	if(isFirefox){
		return {isDialEnabled,isAutoDialEnabled}
	}
	
	try{
		const webTransportEvents = data.libp2p_webtransport_dialer_events_total
		
		const newPending = (webTransportEvents.pending ?? 0) - (lastStats.pending ?? 0)
		const newReadyError = (webTransportEvents.ready_error ?? 0) - (lastStats.ready_error ?? 0)
		const newNoiseError = (webTransportEvents.noise_error ?? 0) - (lastStats.noise_error ?? 0)
		const newUpgradeError = (webTransportEvents.upgrade_error ?? 0) - (lastStats.upgrade_error ?? 0)
		const newClose = (webTransportEvents.close ?? 0) - (lastStats.close ?? 0)
		const newReady = (webTransportEvents.ready ?? 0) - (lastStats.ready ?? 0)
		const newAbort = (webTransportEvents.abort ?? 0) - (lastStats.abort ?? 0)
		const newReadyTimeout = (webTransportEvents.ready_timeout ?? 0) - (lastStats.ready_timeout ?? 0)
		const newNoiseTimeout = (webTransportEvents.noise_timeout ?? 0) - (lastStats.noise_timeout ?? 0)
		const newOpen = (webTransportEvents.open ?? 0) - (lastStats.open ?? 0)
		const newRemoteClose = (webTransportEvents.remote_close ?? 0) - (lastStats.remote_close ?? 0)

		stats.pending += newPending
		stats.pending -= newReadyTimeout
		stats.pending -= newNoiseTimeout
		stats.pending -= newReadyError
		stats.pending -= newNoiseError
		stats.pending -= newUpgradeError
		stats.pending -= newOpen

		stats.open += newOpen
		stats.open -= newClose
		stats.open -= newRemoteClose
		stats.open -= newAbort

		stats.ready_error = newReadyError
		stats.noise_error = newNoiseError
		stats.upgrade_error = newUpgradeError
		stats.ready_timeout = newReadyTimeout
		stats.noise_timeout = newNoiseTimeout
		stats.close = newClose
		stats.abort = newAbort
		stats.remote_close = newRemoteClose

		totals.success += newReady
		totals.readyErrored += newReadyError
		totals.noiseErrored += newNoiseError
		totals.upgradeErrored += newUpgradeError
		totals.readyTimedout += newReadyTimeout
		totals.noiseTimedout += newNoiseTimeout

		const errors = totals.readyErrored + totals.noiseErrored + totals.upgradeErrored
		const timeouts = totals.readyTimedout + totals.noiseTimedout
		//const failureRate = ((errors + timeouts) / (errors + timeouts + totals.success) * 100).toFixed(2)
		
		lastStats = webTransportEvents
		
		fail = errors+timeouts
		//const treshold = errors+timeouts+stats.open+stats.pending
		//console.log('fail',fail)
		
		//detect fail timeout, in chrome fail webtransport get reset after 5 minutes
		if(lastfail>fail){
			setTimeout(()=>{
				if(isAutoDialEnabled){
					lastfailtresholdauto = lastfailtresholdauto+(lastfail-fail)
				}
				if(isDialEnabled){
					lastfailtreshold = lastfailtreshold+(lastfail-fail)
				}
			},5*60*1000)
		}
		lastfail = fail
		
		if ((fail-lastfailtreshold)>config.CONFIG_DIAL_MAX_ERROR_LIMIT){
			if(isDialEnabled){
				isDialEnabled = false
				console.warn('Peer dial is temporary disabled')
				if(isAutoDialEnabled){
					isAutoDialEnabled = false
					console.warn('Peer autodial is temporary disabled')
				}
				setTimeout(()=>{
					if(!isDialEnabled){
						isDialEnabled = true
						lastfailtreshold = fail
						console.warn('Peer dial is resumed')
						if(!isAutoDialEnabled){
							isAutoDialEnabled = true
							lastfailtresholdauto = fail
							console.warn('Peer autodial is resumed')
						}
					}
				},6*60*1000)
			}
		}

		if ((fail-lastfailtresholdauto)>config.CONFIG_AUTODIAL_MAX_ERROR_LIMIT){
			if(isAutoDialEnabled){
				isAutoDialEnabled = false
				console.warn('Peer autodial is temporary disabled')
				const last = fail
				setTimeout(()=>{
					if(!isAutoDialEnabled && isDialEnabled){
						isAutoDialEnabled = true
						lastfailtresholdauto = fail
						console.warn('Peer autodial is resumed')
						if(isDialEnabled){
							lastfailtreshold = last
						}
					}
				},6*60*1000)
			}
		}
		
		return {isDialEnabled,isAutoDialEnabled}
		
	}
	catch{
		console.debug('Metrics error')
	}
}

/*
onunhandledrejection = function(evt) {
    console.warn(evt.reason);
	return
}
*/

export async function getDigest(){
	const buf = new TextEncoder().encode(Math.random().toString())
	const digest = await sha256.encode(buf)
	return digest
}

//detect webtransport
if(!WebTransport){
	throw mkErr('It seems that your browser does not support the required WebTransport feature')
}