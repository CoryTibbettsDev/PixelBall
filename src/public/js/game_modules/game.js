import { Ball } from './ball.js'
import { Goal } from './goal.js'
import { Player } from './player.js'

export class Game {
	// Pass in ctx which is context of the canvas so we can draw the game stuff
	constructor(gameRoom, ctx) {
		this.timestamp = 0
		this.oldTimestamp = 0
		this.delta = 0
		this.canvas = {
			width: 1600,
			height: 900
		}
		this.balls = []
		this.goals = []
		this.players = []
		this.ctx = ctx
		this.gameRoom = gameRoom
		this.gameEnds = false
		// So we can stop server loop
		this.interval = function() {}
		// Stores ID so we can stop client loop with window.cancelAnimationFrame
		// Needs to be updated every loop so we have the right ID
		// Used in this.clientLoop and this.startClientLoop
		this.rafID = 0
	}
	// Need to call whenever a new game is created
	createGamePieces(player1ID, player2ID) {
		// Add goals
		this.goals.push(new Goal('left', this.canvas.width, this.canvas.height))
		this.goals.push(new Goal('right', this.canvas.width, this.canvas.height))

		// Add balls
		this.balls.push(new Ball(this.canvas.width, this.canvas.height))

		// Add players
		this.players.push(new Player('left', player1ID, this.canvas.width,
		this.canvas.height))
		this.players.push(new Player('right', player2ID, this.canvas.width,
		this.canvas.height))

		// Call goal reset to put everything in starting positions
		this.goalReset()
	}
	setKeyState(keyState) {
		for (let i = 0; i < this.players.length; i++) {
			if(this.players[i].id == keyState.id) {
				this.players[i].keyState = keyState
			}
		}
	}
	goalReset() {
		// Iterate through array and runs reset function on every item array
		this.players.forEach((item, i) => {
			item.reset()
		});
		this.balls.forEach((item, i) => {
			item.reset()
		});
	}
	serverEnd(io) {
		if (this.gameEnds) {
			io.to(this.gameRoom).emit('gameEnds', 'game over')
			clearInterval(this.interval)
		}
		let gameData = {
			balls: this.balls,
			players: this.players
		}
		io.to(this.gameRoom).emit('server update', gameData)
	}
	// Important functions that go in game loop
	update(delta) {
		// Movement and update functions go here
		// Update functions have to come after input and move so nothing goes
		// out of bounds or ends up in the wrong place
		this.players.forEach((item, i) => {
			item.input(delta)
			item.update()
		});

		this.balls.forEach((item, i) => {
			item.move(delta)
			item.update(this.goals, this.players)
			// Check if ball scored this loop
			if (item.scored) {
				this.goalReset()
			}
			// Check if game should end this loop
			if (item.gameEnds) {
				this.gameEnds = true
			}
		});
	}
	draw(ctx) {
		// Clear screen
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		// Drawing background
		ctx.fillStyle = 'gray'
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
		// Draw all the game elements
		this.players.forEach((item, i) => {
			item.draw(ctx)
		});
		this.balls.forEach((item, i) => {
			item.draw(ctx)
		});
		this.goals.forEach((item, i) => {
			item.draw(ctx)
		});
	}

	// Important game loop functions
	clientLoop(timestamp) {
		// Have to use arrow function to call clientLoop instead of just passing
		// it into requestAnimationFrame because otherwise this keyword gets
		// reset to window object when called
		this.rafID = window.requestAnimationFrame((timestamp) => {
			this.clientLoop(timestamp)
		})
		// timestamp can be NaN for the first couple loops sometimes which
		// screws stuff up so set delta equal to || 0 so delta is always
		// a real number
		this.delta = timestamp - this.oldTimestamp || 0
		this.oldTimestamp = timestamp || 0

		this.update(this.delta)

		// Draw functions here after update
		this.draw(this.ctx)
	}
	// IMPORTANT TIMESTAMP NOTES have to use arrow functions to maintain this
	// however this forces me to continually pass the baton with the timestamp
	// keep handing the callback from requestAnimationFrame to each subsequent
	// function until we get to the actual clientLoop
	startClientLoop() {
		// Set rafID so we can stop animation loop
		// Need to set rafID everyloop so we always are referencing the right
		// ID when we do want to stop the loop
		this.rafID = window.requestAnimationFrame((timestamp) => {
			this.clientLoop(timestamp)
		})
	}
	serverLoop(io) {
		this.delta = this.timestamp - this.oldTimestamp || 0
		this.oldTimestamp = this.timestamp || 0

		this.update(this.delta)

		// Functions for things that need to happen after everything
		// cleanup, updating FPS etc.
		this.serverEnd(io)

		this.timestamp = Date.now()
	}
	startServerLoop(io) {
		this.timestamp = Date.now()
		this.oldTimestamp = Date.now()

		// https://stackoverflow.com/questions/
		// 2749244/javascript-setinterval-and-this-solution
		// Use arrow function within setInterval so this keyword does not get
		// redifined to global scope when called
		this.interval = setInterval(() => {
			this.serverLoop(io)
		}, 1000/60)
	}
}
