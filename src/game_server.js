import { io } from './index.js'

import { Game } from './public/js/game_modules/game.js'

// Stuff happens on connection to socket
// Apparently can say io.on() or io.sockets.on()
export function playerConnect() {
	// Array to store all the players in the matchmaking queue
	let inQueue = []
    io.on('connection', socket => {
		console.log('got a new connection from:', socket.id);
		inQueue.push(socket)

		if(inQueue.length > 1) {
			let roomName = 'game' + inQueue[0].id + inQueue[1].id
			// Adds the first two players inQueue to a room together
			inQueue[0].join(roomName)
			inQueue[1].join(roomName)
			let player1ID = inQueue[0].id
			let player2ID = inQueue[1].id
			// Removes the players from queue since they are now in a game room
			inQueue.splice(0, 2)
			startGame(roomName, io, socket, player1ID, player2ID)
		}
    });
}

function startGame(gameRoom, io, socket, player1ID, player2ID) {
	const game = new Game(gameRoom)
	// Create game pieces pass in socketIDs we got on connection
	game.createGamePieces(player1ID, player2ID)

	io.to(gameRoom).emit('start loop', 'place holder')
	// Pass io into serverloop so it can sent info to game clients
	game.startServerLoop(io)
	// Recieving keyState and what we do with it
	socket.on('send keyState', game.setKeyState)
}
