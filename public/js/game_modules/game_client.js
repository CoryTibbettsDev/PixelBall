// We get io from linking to socket.io-client on html page
// Create socket establish connection requires URL of site
const socket = io.connect('http://localhost:3000');

import { Ball, Barrier, Goal, Player, Tele } from './game_elements.js'
import { canvas as canvasPlaceHolder, goals, players, timestep } from './game_variables.js'
// Have to define these variables in this file or we cannot redifine them
let delta = 0, timestamp = 0, oldTimestamp = 0
import { createGamePieces, goalReset, inputPlayers, updatePlayers, drawPlayers, drawGoals } from './game_functions.js'

// Stuff happens on connection
socket.on('connect', () => {
    console.log('connected on socket', socket.id);
    keyState.id = socket.id
});
// Tells game to startup the mainLoop
socket.on('start loop', startLoop)

// Handle updated gamestate from the server
socket.on('server update', serverUpdate)
function serverUpdate(gameData) {
    // Set ball equal to data from server so we keep game state same as
    // authoritative game state on server
    ball.x = gameData.ball.x
    ball.y = gameData.ball.y
    ball.xvel = gameData.ball.xvel
    ball.yvel = gameData.ball.yvel
}

canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvasPlaceHolder.width
canvas.height = canvasPlaceHolder.height

// Handling player input
let keyState = {}
// Need arrow function here so the this keyword doesn't get redifined to
// global scope when called (This was for when this was a part of Player object)
// Changes keyState instead of changing speed directly on keypress
// found to be more responsive this way idk why
window.addEventListener('keydown', (e) => {
    keyState[e.key] = true
    //sendKeyState()
}, true)
window.addEventListener('keyup', (e) => {
    keyState[e.key] = false
    //sendKeyState()
}, true)
// Function to send out keyState on every update
function sendKeyState() {
    socket.emit('send keyState', keyState)
}

// Update all the positions and actions of the stuff we draw
function update(delta) {
    // Movement and update functions go here
    // updatePlayers();
    ball.move(delta);
    ball.update()
}

// Draws all the shit we see on screen
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayers();
    drawBalls();
    drawGoals()
}

createGamePieces()
let ball = new Ball()

// Need enclosing function so socket message can call to start animation properly
// If mainLoop called directly animation starts upon evaluation not when called
function startLoop(playersPlaceHolder) {
    console.log('game started');
    // Push to client players array to match players array on server
    players.push(playersPlaceHolder[0])
    players.push(playersPlaceHolder[1])
    console.log(players);

    function mainLoop(timestamp) {
        delta = timestamp - oldTimestamp
        oldTimestamp = timestamp

        update(delta)

        // Draw function goes here after update very important
        draw()

        requestAnimationFrame(mainLoop)
    }
    requestAnimationFrame(mainLoop)
}
