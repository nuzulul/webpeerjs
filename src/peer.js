/* eslint-disable import/export */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { decodeMessage, encodeMessage, message } from 'protons-runtime';
import { alloc as uint8ArrayAlloc } from 'uint8arrays/alloc';
export var Peer;
(function (Peer) {
    let _codec;
    Peer.codec = () => {
        if (_codec == null) {
            _codec = message((obj, w, opts = {}) => {
                if (opts.lengthDelimited !== false) {
                    w.fork();
                }
                if ((obj.publicKey != null && obj.publicKey.byteLength > 0)) {
                    w.uint32(10);
                    w.bytes(obj.publicKey);
                }
                if (obj.addrs != null) {
                    for (const value of obj.addrs) {
                        w.uint32(18);
                        w.bytes(value);
                    }
                }
                if (opts.lengthDelimited !== false) {
                    w.ldelim();
                }
            }, (reader, length) => {
                const obj = {
                    publicKey: uint8ArrayAlloc(0),
                    addrs: []
                };
                const end = length == null ? reader.len : reader.pos + length;
                while (reader.pos < end) {
                    const tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1: {
                            obj.publicKey = reader.bytes();
                            break;
                        }
                        case 2: {
                            obj.addrs.push(reader.bytes());
                            break;
                        }
                        default: {
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                }
                return obj;
            });
        }
        return _codec;
    };
    Peer.encode = (obj) => {
        return encodeMessage(obj, Peer.codec());
    };
    Peer.decode = (buf) => {
        return decodeMessage(buf, Peer.codec());
    };
})(Peer || (Peer = {}));
