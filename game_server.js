import { io } from './index.js'

import { game } from './public/js/game_modules/game.js'
game.createGamePieces()

// Stuff happens on connection to socket
// Apparently can say io.on() or io.sockets.on()
// Don't know why they set it up that way
export function playerConnect() {
    io.on('connection', socket => {
        console.log('got a new connection from:', socket.id);
        socket.join('game')

        // Gets the room of our game so we can see sockets attached to the room and it's length
        let room = io.sockets.adapter.rooms['game'];
        // Create players on connection
        if (room.length == 1) {
            game.players.push(new game.Player('left', socket.id))
        } else if (room.length == 2) {
            game.players.push(new game.Player('right', socket.id))
            // Send out players array and starts game on client and server
            io.to('game').emit('start loop', game)
            game.startServerLoop()
            console.log('started');
        } else {
            console.log('too many players');
        }

        // Recieving keyState and what we do with it
        /* socket.on('send keyState', setKeyState)
        function setKeyState(keyState) {
            for(let i = 0; i < players.length; i++) {
                if (players[i].id = keyState.id) {
                    players[i].keyState = keyState.keyState
                }
            }
        } */
    });
}
