// We get io from linking to socket.io-client on html page
// Create socket establish connection requires URL of site if served from
// different domain we don't so don't need to pass anything in
// Init socket globally makes things easier for past me future me can fuck off
let socket;

let queing = false
function startMatchmaking() {
	// Add user to que if not in que and change button
	if (!queing) {
		socket = io.connect()
		setClient.inQueue()

		socket.on('joinGame', gameMode)
		function gameMode(gameRoom) {
			display.showGame()
			callGame(socket)
			// Removed from queue because they are in game now
			setClient.outOfQueue()
		}
	} else {
		// Disconnect from server and server will remove from queue
		socket.disconnect()
		setClient.outOfQueue()
	}
}

let matchmakingButton = document.getElementById('matchmakingButton')
matchmakingButton.addEventListener("click", startMatchmaking);
// This class lets use easily set the client in and out of queue
class SetClientStatus {
	constructor(button) {
		this.button = button
	}
	inQueue() {
		this.button.innerHTML = "Leave Game Queue"
		queing = true
	}
	outOfQueue() {
		// Change button back
		this.button.innerHTML = "Join Game Queue"
		queing = false
	}
}
let setClient = new SetClientStatus(matchmakingButton)

let homeElements = document.getElementsByClassName('homeElement')
let gameElements = document.getElementsByClassName('gameElement')
let overlayMenu = document.getElementById('overlayMenu')
// Controls what html elements are displayed
class Display {
	constructor(homeElements, gameElements, overlayMenu) {
		this.homeElements = homeElements
		this.gameElements = gameElements
		this.overlayMenu = overlayMenu
	}
	setDisplay(elementArray, displayType) {
		for (let i = 0; i < elementArray.length; i++) {
			elementArray[i].style.display = displayType
		}
	}
	showHome() {
		this.setDisplay(this.gameElements, "none")
		this.setDisplay(this.homeElements, "block")
	}
	showGame() {
		this.setDisplay(this.homeElements, "none")
		this.setDisplay(this.gameElements, "block")
	}
	showOverlayMenu() {
		this.overlayMenu.style.display = "block"
	}
	hideOverlayMenu() {
		this.overlayMenu.style.display = "none"
	}
}
let display = new Display(homeElements, gameElements, overlayMenu)
display.showHome()

// OverlayMenu buttons and what they do
let toHomeBtn = document.getElementById('toHomeBtn')
toHomeBtn.addEventListener("click", redirectToHome)
// Probably don't need a function for this but this is easy right now
function redirectToHome() {
	// Redirects to index.html which means it reloads entire page to go there
	// Don't think there is a problem with doing that right now
	window.location.href = '/'
}
let playAgainBtn = document.getElementById('playAgainBtn')
playAgainBtn.addEventListener("click", reQueue)
// Shows home elements and puts them in queue again with one click
function reQueue() {
	display.hideOverlayMenu()
	display.showHome()
	// Call startMatchmaking to begin process again and we took care of the
	// visual stuff above
	startMatchmaking()
}

import { Game } from './game_modules/game.js'
import { Tele } from './game_modules/tele.js'
import { Barrier } from './game_modules/barrier.js'

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });

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
		window.cancelAnimationFrame(game.rafID)
		display.showOverlayMenu()
	}
}
