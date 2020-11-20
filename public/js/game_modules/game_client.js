// We get io from linking to socket.io-client on html page
// Create socket establish connection requires URL of site if served from
// different domain we don't so don't need to pass anything in
const socket = io.connect();

import { game } from './game.js'

game.createGamePieces()

const canvas = document.getElementById('canvas');
game.ctx = canvas.getContext('2d', { alpha: false });
canvas.width = game.canvas.width
canvas.height = game.canvas.height

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
socket.on('start loop', game.startClientLoop)

function clientBegin() {
    // Set client ball equal to ball sent from server
    if(gameDataChanged) {
        gameDataChanged = false
        game.balls[0].x = serverGameData.balls[0].x
        game.balls[0].y = serverGameData.balls[0].y
        game.balls[0].xvel = serverGameData.balls[0].xvel
        game.balls[0].yvel = serverGameData.balls[0].yvel

		game.players[0].x = serverGameData.players[0].x
		game.players[0].y = serverGameData.players[0].y
		game.players[1].x = serverGameData.players[1].x
		game.players[1].y = serverGameData.players[1].y
    }
}
game.setBegin(clientBegin)

// Handle updated gamestate from the server
let gameDataChanged = false
let serverGameData = {}
socket.on('server update', serverUpdate)
function serverUpdate(gameData) {
    // Set ball equal to data from server so we keep game state same as
    // authoritative game state on server
    serverGameData = gameData
    gameDataChanged = true
}
