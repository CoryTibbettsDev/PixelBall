import { io } from './index.js'

import { Game } from './public/js/game_modules/game.js'

// Stuff happens on connection to socket
// Apparently can say io.on() or io.sockets.on()
export function playerConnect() {
	// Array to store all the players in the matchmaking queue
	let inQueue = []
	// Object that stores all the games taking place currently
	let games = {}
    io.on('connection', socket => {
		console.log('got a new connection from:', socket.id);
		// Add player socket to queue
		inQueue.push(socket)

		if(inQueue.length > 1) {
			let roomName = 'game' + inQueue[0].id + inQueue[1].id
			// Adds the first two players inQueue to a room together
			inQueue[0].join(roomName)
			inQueue[1].join(roomName)
			startGame(games, roomName, io, socket, inQueue[0].id, inQueue[1].id)
			// Removes the players from queue since they are now in a game room
			inQueue.splice(0, 2)
		}

		// Recieving keyState and what we do with it
		socket.on('clientKeyState', (keyState) => {
			games[keyState.gameRoom].setKeyState(keyState)
		})
	});
}

function startGame(games, gameRoom, io, socket, player1ID, player2ID) {
	games[gameRoom] = new Game(gameRoom)
	// Create game pieces pass in socketIDs we got on connection
	games[gameRoom].createGamePieces(player1ID, player2ID)

	io.to(gameRoom).emit('start loop', gameRoom)
	// Pass io into serverloop so it can sent info to game clients
	games[gameRoom].startServerLoop(io)
}
