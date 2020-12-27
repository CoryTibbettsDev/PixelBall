// We get io from linking to socket.io-client on html page
// Create socket establish connection requires URL of site if served from
// different domain we don't so don't need to pass anything in
let queing = false

// Init socket globally makes things easier for past me future me can fuck off
let socket;
function startMatchmaking() {
	// Add user to que if not in que and change button
	if (!queing) {
		socket = io.connect()
		setPlayerInQueue()

		socket.on('joinGame', gameMode)
		function gameMode(gameRoom) {
			showGameElements()
			callGame(socket)
		}
	} else {
		// Disconnect from server and server will remove from que
		socket.disconnect()
		setPlayerOutOfQueue()
	}
}

let button = document.getElementById('matchmakingButton')
button.addEventListener("click", startMatchmaking);
// These functions let use easily set the queing and button status
function setPlayerInQueue() {
	// Set button to in queue status
	button.innerHTML = "Leave Game Queue"
	queing = true
}
function setPlayerOutOfQueue() {
	// Change button back
	button.innerHTML = "Join Game Queue"
	queing = false
}

import { Game } from './game.js'
import { Tele } from './tele.js'
import { Barrier } from './barrier.js'

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });

let homeElements = document.querySelectorAll('.homeElement')
let gameElements = document.querySelectorAll('.gameElement')

function showHomeElements() {
	for (let i = 0; i < gameElements.length; i++) {
		gameElements[i].style.display = "none"
	}
	for (let j = 0; j < homeElements.length; j++) {
		homeElements[j].style.display = "block"
	}
}
showHomeElements()
function showGameElements() {
	for (let i = 0; i < gameElements.length; i++) {
		gameElements[i].style.display = "block"
	}
	for (let j = 0; j < homeElements.length; j++) {
		homeElements[j].style.display = "none"
	}
}

function callGame(socket) {
	let gameRoom;
	const game = new Game(gameRoom, ctx)

	canvas.width = game.canvas.width
	canvas.height = game.canvas.height

	// Create the pieces for the game must happen before game loop is started
	game.createGamePieces()

	// Handling player input
	let keyState = {}
	let started = false
	// Need arrow function here so the this keyword doesn't get redifined to
	// global scope when called (This was for when this was a part of Player object)
	// Changes keyState instead of changing speed directly on keypress
	// found to be more responsive this way idk why
	window.addEventListener('keydown', (e) => {
	    keyState[e.key] = true
		keyState.id = socket.id
		keyState.gameRoom = game.gameRoom
		sendKeyState(keyState)
	}, true)
	window.addEventListener('keyup', (e) => {
	    keyState[e.key] = false
		keyState.id = socket.id
		keyState.gameRoom = game.gameRoom
		sendKeyState(keyState)
	}, true)
	function sendKeyState(keyState) {
		// Have to check if game is started before sending stuff so we know server
		// can except input
		if (started) {
			socket.emit('clientKeyState', keyState)
		}
	}

	// Stuff happens on connection
	socket.on('connect', () => {
	    console.log('connected on socket', socket.id);
	});
	// Tells game to startup the mainLoop
	socket.on('start loop', startLoop)

	// Starts loop on clientside
	function startLoop(gameRoom) {
		(() => {
			started = true
			game.gameRoom = gameRoom
			game.startClientLoop()
		})()
	}

	socket.on('server update', serverUpdate)
	// Sets values of different game elements equal to the server's versions
	function serverUpdate(gameData) {
		gameData.balls.forEach((item, i) => {
			game.balls[i].xvel = item.xvel
			game.balls[i].yvel = item.yvel
			game.balls[i].x = item.x
			game.balls[i].y = item.y
		});
		gameData.players.forEach((item, i) => {
			game.players[i].x = item.x
			game.players[i].y = item.y
			game.players[i].score = item.score

			// Create new teles that are equal to the teles server sent I cannot
			// set the arrays equal to one another because the functions attached
			// to teles and barries are lost so they won't draw
			for(let j = 0; j < item.teleEnts.length; j++) {
				game.players[i].teleEnts[j] = new Tele(item.teleEnts[j].x,
				item.teleEnts[j].y, item.teleEnts[j].r, item.teleEnts[j].color)
			}
			for(let k = 0; k < item.teleExts.length; k++) {
				game.players[i].teleExts[k] = new Tele(item.teleExts[k].x,
				item.teleExts[k].y, item.teleExts[k].r, item.teleExts[k].color)
			}
			for(let l = 0; l < item.barriers.length; l++) {
				game.players[i].barriers[l] = new Barrier(item.barriers[l].x,
				item.barriers[l].y)
			}
		});
	}
	socket.on('gameEnds', gameEnds)
	function gameEnds() {
		createMenu()
		setPlayerOutOfQueue()
	}

	function createMenu() {
		// create a new div element
		const newDiv = document.createElement("div");
		// and give it some content
		const newContent = document.createTextNode("The game is over");
		const newButton = document.createElement("button")
		// Give button text
		newButton.innerHTML = "Click For Homepage"
		newButton.onclick = function() {
			showHomeElements()
			newDiv.style.display = "none"
		}
		// add the text node to the newly created div
		newDiv.appendChild(newContent);
		newDiv.appendChild(newButton);

		document.body.insertBefore(newDiv, canvas);
	}
}
