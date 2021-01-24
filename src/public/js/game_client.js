// We get io from linking to socket.io-client on html page
// Create socket establish connection requires URL of site if served from
// different domain we don't so don't need to pass anything in
// Init socket globally makes things easier for past me future me can fuck off
let socket;

let queing = false

let matchmakingButton = document.getElementById('matchmakingButton')
matchmakingButton.addEventListener("click", startMatchmaking);
function startMatchmaking() {
	// Add user to que if not in que and change button
	if (!queing) {
		socket = io.connect()
		clientStatus.inQueue()

		socket.on('joinGame', gameMode)
		function gameMode(gameRoom) {
			display.showGame()
			// callGame does setup for game and starts the game loop
			callGame(socket)
			// Removed from queue because they are in game now
			clientStatus.outOfQueue()
		}
	} else {
		// Disconnect from server and server will remove from queue
		socket.disconnect()
		clientStatus.outOfQueue()
	}
}

// This class lets use easily set the client in and out of queue
class ClientStatus {
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
let clientStatus = new ClientStatus(matchmakingButton)

import { Display } from './client_modules/display.js'
let homeElements = document.getElementsByClassName('homeElement')
let gameElements = document.getElementsByClassName('gameElement')
let overlayMenu = document.getElementById('overlayMenu')
let overlayTimer = document.getElementById('overlayTimer')
let display = new Display(homeElements, gameElements, overlayMenu, overlayTimer)
display.showHome()

// OverlayMenu buttons and what they do
let toHomeBtn = document.getElementById('toHomeBtn')
toHomeBtn.addEventListener("click", redirectToHome)
// Probably don't need a function for this but this is easy right now
function redirectToHome() {
	// Redirects to index.html which means it reloads entire page to go there
	// Don't think there is a problem with doing that right now
	// Created whole function b/c I thought there might be something else I need
	// to do on redirect later
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

// Moved outside call game function so images are loaded on page load
// Defining the colors we want the player and their elements to be
let clientColors = {
	playerImage: new Image(),
	player: 'lightblue',
	teleEnt: 'green',
	teleExt: 'blue',
	barrier: 'turqoise'
}
let oppColors = {
	playerImage: new Image(),
	player: 'red',
	teleEnt: 'orange',
	teleExt: 'yellow',
	barrier: 'beige'
}
let playerColors = {
	p1Colors: {},
	p2Colors: {}
}
clientColors.playerImage.src = '../img/blue_player.png'
oppColors.playerImage.src = '../img/red_player.png'

function callGame(socket) {
	const game = new Game(null, ctx)

	canvas.width = game.canvas.width
	canvas.height = game.canvas.height

	// Stuff happens on connection
	socket.on('connect', () => {
	    // console.log('connected on socket', socket.id);
	});

	// Listen for event that tells us which player the client is
	// Set the client and opponent colors according to which player we are told
	// the client is
	socket.on('whichPlayer', setPlayerInfo)
	function setPlayerInfo(player) {
		if (player == 'player1') {
			playerColors.p1Colors = clientColors
			playerColors.p2Colors = oppColors
		} else if (player == 'player2') {
			playerColors.p1Colors = oppColors
			playerColors.p2Colors = clientColors
		} else {
			console.log('Never got player info');
		}
	}

	// Tells game to startup the mainLoop
	socket.on('start loop', startLoop)
	// Starts loop on clientside
	function startLoop(gameRoom) {
		// Need arrow function so scope is not redifined
		(() => {
			started = true
			game.gameRoom = gameRoom
			// Create the pieces for the game must happen before game loop
			game.createGamePieces()
			// Set each player's colors
			game.players[0].colors = playerColors.p1Colors
			game.players[1].colors = playerColors.p2Colors
			game.startClientLoop()
		})()
	}

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
		// Have to check if game is started before sending stuff so we know
		// server can except input
		if (started) {
			socket.emit('clientKeyState', keyState)
		}
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
			for (let j = 0; j < item.teleEnts.length; j++) {
				game.players[i].teleEnts[j] = new Tele(item.teleEnts[j].x,
				item.teleEnts[j].y, item.teleEnts[j].r)
			}
			for (let k = 0; k < item.teleExts.length; k++) {
				game.players[i].teleExts[k] = new Tele(item.teleExts[k].x,
				item.teleExts[k].y, item.teleExts[k].r)
			}
			for (let l = 0; l < item.barriers.length; l++) {
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
