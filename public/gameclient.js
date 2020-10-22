// Create socket establish connection requires URL of site
const socket = io.connect('http://localhost:3000');

// Stuff happens on connection
socket.on('connect', () => {
    console.log('connected');
    keyState.id = socket.id
});
// Tells game to startup the mainLoop
socket.on('start', start)

// Handle updated gamestate from the server
socket.on('server update', serverUpdate)
function serverUpdate(gameData) {
    // Set ball equal to data from server so we keep game state same as authoritative game state on server
    ball.x = gameData.ball.x
    ball.y = gameData.ball.y
    ball.xvel = gameData.ball.xvel
    ball.yvel = gameData.ball.yvel
}

// Creating and appending canvas to page
let createCanvas = document.createElement('canvas');

createCanvas.id = "gameCanvas";
createCanvas.width = 2000
createCanvas.height = createCanvas.width/2

let body = document.getElementsByTagName("body")[0];
body.appendChild(createCanvas);

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// Defining important time based variables
export let delta = 0
let timestamp = 0
let oldTimestamp = 0
let timestep = 1000/60

// FPS variables
/* let fpsDisplay = document.getElementById('fpsDisplay') */
let fps = 60
let framesThisSecond = 0
let lastFPSUpdate = 0

import { Player } from './game_modules/player.js'
import { Ball } from './game_modules/ball.js'
import { Goal } from './game_modules/goal.js'

// Handling player input
let keyState = {}
// Need arrow function here so the this keyword doesn't get redifined to global scope when called (This was for when this was a part of Player object)
// Changes keyState instead of changing speed directly on keypress found to be more responsive idk why
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

export function goalReset() {
    ball.reset()

    for (let i = 0; i < players.length; i++) {
        players[i].reset();
    }
}

// Loop through array to run functions for all the players
/* function updatePlayers() {
    for (let i = 0; i < players.length; i++) {
        players[i].input();
    }
} */
function drawPlayers() {
    for (let i = 0; i < players.length; i++) {
        players[i].draw();

        // Loop within loop to loop through players and then loop through the arrays associated with each player
        // So we can draw the things associated with them
        for (let j = 0; j < players[i].teleEnts.length; j++) {
            players[i].teleEnts[j].draw()
        }
        for (let j = 0; j < players[i].teleExts.length; j++) {
            players[i].teleExts[j].draw()
        }
        for (let j = 0; j < players[i].barriers.length; j++) {
            players[i].barriers[j].draw()
        }
    }
}

// Loop through array to run functions for all the goals
function drawGoals() {
    for (let i = 0; i < goals.length; i++) {
        goals[i].draw()
    }
}

// Update all the positions and actions of the stuff we draw
function update(delta) {
    // Movement and update functions go here
    /* updatePlayers(); */

    ball.move();

    ball.update()
}

// Draws all the shit we see on screen
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayers();

    ball.draw();

    drawGoals()

    // Display fps
    /* fpsDisplay.textContent = Math.floor(fps) + ' FPS'; */
}

function panic() {
    console.log('Panic!');
    delta = 0
}

// Creating the permanant game elements
export let ball = new Ball();

export let goals = []
goals.push(new Goal('left', 0))
goals.push(new Goal('right', canvas.width - 50)) // Hard coded goal width b/c idk how to reference Goal.w property here

export let players = [];

// Need enclosing function so socket message can call to start animation properly
// If mainLoop called directly animation starts upon evaluation not when called
function start(serverPlayers) {
    console.log('game started');
    // Creates players to array data sent from server
    players.push(new Player(serverPlayers[0].side, serverPlayers[0].id))
    players.push(new Player(serverPlayers[1].side, serverPlayers[1].id))

    let numUpdateSteps = 0
    function mainLoop(timestamp) {
        // Calculating FPS I think should have before we fuck the time calcs
        if (timestamp > lastFPSUpdate + 1000) { // update every second
            fps = framesThisSecond; // Hand off the fps value so we can count with other variable

            lastFPSUpdate = timestamp;
            framesThisSecond = 0;
        }
        framesThisSecond++


        delta += timestamp - oldTimestamp // Need += here
        oldTimestamp = timestamp

        numUpdateSteps = 0
        // Simulate the total elapsed time in fixed-size chunks
        while (delta >= timestep) {
            update(timestep)
            console.log(delta);
            delta -= timestep
            console.log(delta);

            // Panic if some
            numUpdateSteps++
            if (numUpdateSteps >= 240) {
                panic();
                break;
            }
        }

        // Draw function goes here after update very important
        draw()

        requestAnimationFrame(mainLoop)
    }
    requestAnimationFrame(mainLoop)
}
