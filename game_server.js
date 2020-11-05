import { io } from './index.js'

import { Ball, Barrier, Goal, Player, Tele } from './public/js/game_modules/game_elements.js'
import { canvas, goals, players, timestep } from './public/js/game_modules/game_variables.js'
// Have to define these variables in this file or we cannot redifine them
let delta = 0, timestamp = 0, oldTimestamp = 0
import { createGamePieces, goalReset, inputPlayers, updatePlayers, drawPlayers, drawGoals } from './public/js/game_modules/game_functions.js'

// Stuff happens on connection to socket
// Apparently can say io.on() or io.sockets.on()
export function playerConnect() {
    io.on('connection', socket => {
        console.log('got a new connection from:', socket.id);
        socket.join('game')

        // Gets the room of our game so we can see sockets attached to the room and it's length
        let room = io.sockets.adapter.rooms['game'];
        // Create players on connection
        if (room.length == 1) {
            players.push(new Player('left', socket.id))
        } else if (room.length == 2) {
            players.push(new Player('right', socket.id))
            // Send out players array and starts game on client and server
            io.to('game').emit('start loop', players)
            startLoop()
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

// Update all the positions and actions of the stuff we draw
function update(delta) {
    // Movement and update functions go here
    updatePlayers(delta);

    ball.move(delta);

    ball.update()
}

// Have to define ball outside of startLoop or else ball is undefined
// Think it is because update can't "see" the ball
createGamePieces()
let ball = new Ball()

// Wrap mainLoop in enclosing function so we can start the mainLoop when we want
function startLoop() {
    // Initialize variable so we can update and use in the game loop
    let gameInfo = {}

    timestamp = Date.now()
    oldTimestamp = Date.now()

    function mainLoop() {
        delta = timestamp - oldTimestamp
        oldTimestamp = timestamp

        update(delta)

        // Define & send out game information
        gameInfo = {
            ball: ball,
            players: players
        }
        io.to('game').emit('server update', gameInfo)

        timestamp = Date.now()
    }
    setInterval(mainLoop, timestep)
}
