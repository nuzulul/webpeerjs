export class webpeerjs {
    static createWebpeer(): Promise<webpeerjs>;
    constructor(libp2p: any, dbstore: any, onMetrics: any);
    id: any;
    status: any;
    IPFS: {
        libp2p: any;
        discoveredPeers: Map<any, any>;
    };
    address: any[];
    peers: any[];
    onJoin: (f: any) => any;
    onLeave: (f: any) => any;
    joinRoom: (room: any) => any[];
    #private;
}
