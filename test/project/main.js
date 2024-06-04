import { webpeerjs } from 'webpeerjs'

void async function main() {

	const node = await webpeerjs.createWebpeer()
	
	console.log(`My node id : ${node.id}`)
	
	const [send,listen,members] = node.joinRoom('myroom')
	
	listen((message,id) => {
		console.log(`Message from ${id} : ${message}`)
	})
	
	members((data) => {
		console.log(`Members : ${data}`)
		send("Hello")
	})
	
	setInterval(()=>{
		//console.log("peers",node.peers)
		//send(node.id)
	},500)
	
}()