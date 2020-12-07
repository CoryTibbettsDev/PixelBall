import { io } from './index.js'

import { Game } from './public/js/game_modules/game.js'

let placeHolder = {}

// Stuff happens on connection to socket
// Apparently can say io.on() or io.sockets.on()
// Don't know why they set it up that way
export function playerConnect() {
	let player1ID, player2ID
    io.on('connection', socket => {
        console.log('got a new connection from:', socket.id);
        socket.join('game')
        // Gets the room of our game so we can see sockets attached to the room
        // and it's length
        let room = io.sockets.adapter.rooms['game'];
        // Create players on connection
        if (room.length == 1) {
			player1ID = socket.id
        } else if (room.length == 2) {
			player2ID = socket.id
            console.log('started');

			startGame(player1ID, player2ID)
			io.to('game').emit('start loop', placeHolder)
		} else {
            console.log('too many players');
        }

		// // Recieving keyState and what we do with it
		// socket.on('send keyState', setKeyState)
		// function setKeyState(keyState) {
		//     for(let i = 0; i < game.players.length; i++) {
		//         if (game.players[i].id == keyState.id) {
		//             game.players[i].keyState = keyState
		//         }
		//     }
		// }
    });
}

function startGame(player1ID, player2ID) {
	const game = new Game()
	// Create game pieces pass in socketIDs we got on connection
	game.createGamePieces(player1ID, player2ID)
	game.startServerLoop()
}

// function serverEnd() {
// 	gameData = {
// 		hello: 'hello'
// 	}
// 	io.to('game').emit('server update', gameData)
// }
// game.setEnd(serverEnd)
