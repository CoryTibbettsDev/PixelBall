// We get io from linking to socket.io-client on html page
// Create socket establish connection requires URL of site if served from
// different domain we don't so don't need to pass anything in
const socket = io.connect();

import { Game } from './game.js'

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });

const game = new Game(ctx)

canvas.width = game.canvas.width
canvas.height = game.canvas.height

// Create the pieces for the game must happen before game loop is started
game.createGamePieces()

// Handling player input
let keyState = {}
// Need arrow function here so the this keyword doesn't get redifined to
// global scope when called (This was for when this was a part of Player object)
// Changes keyState instead of changing speed directly on keypress
// found to be more responsive this way idk why
window.addEventListener('keydown', (e) => {
    keyState[e.key] = true
	sendKeyState()
}, true)
window.addEventListener('keyup', (e) => {
    keyState[e.key] = false
	sendKeyState()
}, true)
function sendKeyState() {
	// Sound out keystate every update we capture on client and then send to
    // the server to process input and change game state
    socket.emit('send keyState', keyState)
}

// Stuff happens on connection
socket.on('connect', () => {
    console.log('connected on socket', socket.id);
    keyState.id = socket.id
});
// Tells game to startup the mainLoop
socket.on('start loop', startLoop)

// Starts loop on clientside
function startLoop() {
	(() => {
		game.startClientLoop()
	})()
}

socket.on('server update', serverUpdate)
function serverUpdate(gameData) {
    console.log('hello');
	console.log(gameData);
}
