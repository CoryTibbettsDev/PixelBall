// We get io from linking to socket.io-client on html page
// Create socket establish connection requires URL of site
const socket = io.connect('http://localhost:3000');

import { game } from './game.js'

game.createGamePieces()

const canvas = document.getElementById('canvas');
game.ctx = canvas.getContext('2d');
canvas.width = game.canvas.width
canvas.height = game.canvas.height

// Stuff happens on connection
socket.on('connect', () => {
    console.log('connected on socket', socket.id);
    // keyState.id = socket.id
});
// Tells game to startup the mainLoop
socket.on('start loop', game.startClientLoop)

function test() {
    //console.log('Testing game.begin');
}

game.setBegin(test)

// Handle updated gamestate from the server
// socket.on('server update', serverUpdate)
// function serverUpdate(gameData) {
//     // Set ball equal to data from server so we keep game state same as
//     // authoritative game state on server
//     ball.x = gameData.ball.x
//     ball.y = gameData.ball.y
//     ball.xvel = gameData.ball.xvel
//     ball.yvel = gameData.ball.yvel
// }

// Handling player input
// let keyState = {}
// Need arrow function here so the this keyword doesn't get redifined to
// global scope when called (This was for when this was a part of Player object)
// Changes keyState instead of changing speed directly on keypress
// found to be more responsive this way idk why
// window.addEventListener('keydown', (e) => {
//     keyState[e.key] = true
//     //sendKeyState()
// }, true)
// window.addEventListener('keyup', (e) => {
//     keyState[e.key] = false
//     //sendKeyState()
// }, true)
// // Function to send out keyState on every update
// function sendKeyState() {
//     socket.emit('send keyState', keyState)
// }
