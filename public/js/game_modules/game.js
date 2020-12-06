export class Game {
	// Pass in ctx which is context of the canvas so we can draw the game stuff
	constructor(ctx) {
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
	}
	begin() {}
	end() {}
	setBegin(fun) {
		this.begin = fun || this.begin
	}
	setEnd(fun) {
		this.end = fun || this.end
	}
	// Need to call whenever a new game is created
	createGamePieces(player1ID, player2ID) {
		// Add goals
		this.goals.push(new Goal('left', 0,
		this.ctx, this.canvas.width, this.canvas.height))
		// Hard code goal width need better solution
		this.goals.push(new Goal('right', this.canvas.width - 50,
		this.ctx, this.canvas.width, this.canvas.height))

		// Add balls
		this.balls.push(new Ball(this.goals, this.players,
		this.ctx, this.canvas.width, this.canvas.height))

		// Add players
		this.players.push(new Player('left', player1ID, 'lightblue',
		this.ctx, this.canvas.width, this.canvas.height))
		this.players.push(new Player('right', player2ID, 'lightblue',
		this.ctx, this.canvas.width, this.canvas.height))

		// Call goal reset to put everything in starting positions
		this.goalReset()
	}
	goalReset() {
		console.log('reset worked homie');
		// Iterate through array and runs reset function on every item array
		this.players.forEach((item, i) => {
			item.reset()
		});
		this.balls.forEach((item, i) => {
			item.reset()
		});
	}
	// Too much shit in here to just use forEach to loop through I think
	drawPlayers() {
		for(let i = 0; i < this.players.length; i++) {
			this.players[i].draw()
			// Loop within loop to iterate through players and the arrays
			// associated with them like teleEnts teleExts etc.
			for (let j = 0; j < this.players[i].teleEnts.length; j++) {
				this.players[i].teleEnts[j].draw()
			}
			for (let k = 0; k < this.players[i].teleExts.length; k++) {
				this.players[i].teleExts[k].draw()
			}
			for (let l = 0; l < this.players[i].barriers.length; l++) {
				this.players[i].barriers[l].draw()
			}
		}
	}
	// Important functions that go in game loop
	update() {
		// Movement and update functions go here
		// Update functions have to come after input and move so nothing goes
		// out of bounds or ends up in the wrong place
		this.players.forEach((item, i) => {
			item.input(this.delta)
			item.update()
		});

		this.balls.forEach((item, i) => {
			item.move(this.delta)
			item.update()
		});
	}
	draw() {
		// Clear screen
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		// Drawing background
		this.ctx.fillStyle = 'gray'
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
		// Draw all the game elements
		this.drawPlayers()

		this.balls.forEach((item, i) => {
			item.draw()
		});
		this.goals.forEach((item, i) => {
			item.draw()
		});
	}

	// Important game loop functions
	clientLoop(timestamp) {
		// Have to use arrow function to call clientLoop instead of just passing
		// it into requestAnimationFrame because otherwise this keyword gets
		// reset to window object when called
		window.requestAnimationFrame((timestamp) => {
			this.clientLoop(timestamp)
		})
		// timestamp can be NaN for the first couple loops sometimes which
		// screws stuff up so set delta equal to || 0 so delta is always
		// a real number
		this.delta = timestamp - this.oldTimestamp || 0
		this.oldTimestamp = timestamp || 0
		console.log(this.delta)

		// Set function with game.setBegin pass in function
		// Funtion for processing input or other things that need to happen
		// before update and draw
		// this.begin()

		this.update(this.delta)

		// Draw functions here after update
		this.draw()



		// Set functions with game.setEnd
		// Functions for things that need to happen after everything
		// cleanup, updating FPS etc.
		// this.end()
	}
	// IMPORTANT TIMESTAMP NOTES have to use arrow functions to maintain this
	// however this forces me to continually pass the baton with the timestamp
	// keep handing the callback from requestAnimationFrame to each subsequent
	// function until we get to the actual clientLoop
	startClientLoop() {
		window.requestAnimationFrame((timestamp) => {
			this.clientLoop(timestamp)
		})
	}
	serverLoop() {
		this.delta = this.timestamp - this.oldTimestamp || 0
		this.oldTimestamp = this.timestamp || 0

		// Set function with game.setBegin pass in function
		// Funtion for processing input or other things that need to happen
		// before update and draw
		// this.begin()

		this.update(this.delta)

		// Set functions with game.setEnd
		// Functions for things that need to happen after everything
		// cleanup, updating FPS etc.
		// this.end()

		this.timestamp = Date.now()
	}
	startServerLoop() {
		this.timestamp = Date.now()
		this.oldTimestamp = Date.now()

		// https://stackoverflow.com/questions/
		// 2749244/javascript-setinterval-and-this-solution
		// Use arrow function within setInterval so this keyword does not get
		// redifined to global scope when called
		setInterval(() => this.serverLoop(), 1000/60)
	}
}

// Classes for game elements
class Ball {
	constructor(goalArray, playerArray, ctx, canvasWidth, canvasHeight) {
		this.r = 15
		this.x = canvasWidth/2
		this.y = canvasHeight/2
		this.speed = 0.2
		this.color = 'black'
		this.canvasWidth = canvasWidth
		this.canvasHeight = canvasHeight
		this.goalArray = goalArray
		this.playerArray = playerArray
		this.ctx = ctx
	}
	randomDirection() {
		// Outputs -1 or 1 so we get random direction for the ball everytime
		// then multiplied by speed of ball for x/y veloctiy
		let randomDirection = ((Math.round(Math.random()) * 2 - 1) * this.speed)
		return randomDirection
	}
	move(delta) {
		this.x += this.xvel * delta
		this.y += this.yvel * delta
	}
	reset() {
		// Set ball to center
		this.x = this.canvasWidth/2
		this.y = this.canvasHeight/2
		// Radom ball direction on reset
		this.xvel = this.randomDirection()
		this.yvel = this.randomDirection()
	}
	update() {
		// Collision detection and other update functions go here
		// Needs to be called after move in the game update function
		// Naturally called before game update function but that is important

		// Self invoking functions to test collision for different game objects
		// MUST USE ARROW FUNTIONS HERE otherwise this gets redifined to global
		// scope when called
		// MUST USE SEMICOLON AFTER EACH FUNCTION otherwise interpreter gets
		// confused where one functions ends and another begins
		// https://stackoverflow.com/questions/42036349/
		// uncaught-typeerror-intermediate-value-is-not-a-function
		// GOAL COLLISION
		((goals) => {
			for(let i of goals) {
				if(this.x + this.r > i.x && // Left
					this.x - this.r < i.x + i.w && // Right
					this.y + this.r > i.y && // Top
					this.y - this.r < i.y + i.h // Bottom
				) {
					// for(let j of playerArray) {
					// 	if(i.side == j.side) {
					// 		j.score++
					// 		// Can check if score is big enought to win here
					// 	}
					// }
					// CALL GOAL RESET FUNCTION
				}
			}
		})(this.goalArray); // Pass in goal array from game object
		// TELE COLLISION
		((players) => {
			for(let i of players) {
				for(let j of i.teleEnts) {
						// Circle circle collision pythag all over this guy like
						// chicken pox
						let distX = this.x - j.x
						let distY = this.y - j.y
						let distance = Math.sqrt((distX * distX) + (distY * distY))
						if(i.teleExts.length > 0 && distance <= this.r + j.r) {
						this.x = i.teleExts[0].x
						this.y = i.teleExts[0].y
					}
				}
			}
		})(this.playerArray);
		// BARRIER COLLISION
		((players) => {
			for(let i of players) {
				for(let j of i.barriers) {
					// Doesn't check which side is closest just collision
					if(this.x + this.r > j.x &&
						this.x - this.r < j.x + j.w &&
						this.y + this.r > j.y &&
						this.y - this.r < j.y + j.h
					) {
						this.xvel = this.xvel * -1
					}
				}
			}
		})(this.playerArray);
		// Bounces ball of wall
		// Sets x/y to edge of canvas then reverses direction
		// Left wall
		if(this.x - this.r < 0) {
			this.x = 0 + this.r
			this.xvel = -this.xvel
		}
		// Right wall
		if(this.x + this.r > this.canvasWidth) {
			this.x = this.canvasWidth - this.r
			this.xvel = -this.xvel
		}
		// Top wall
		if(this.y - this.r < 0) {
			this.y = 0 + this.r
			this.yvel = -this.yvel
		}
		// Bottom wall
		if(this.y + this.r > this.canvasHeight) {
			this.y = this.canvasHeight - this.r
			this.yvel = -this.yvel
		}
	}
	draw() {
		this.ctx.beginPath()
		this.ctx.arc(this.x, this.y, this.r, 0, Math.PI*2)
		this.ctx.closePath()
		this.ctx.fillStyle = this.color
		this.ctx.fill()
	}
}
class Barrier {
	constructor(x, y, ctx) {
		this.h = 100
		this.w = 2
		this.x = x
		this.y = y
		this.color = 'blue'
		this.ctx = ctx
	}
	draw() {
		this.ctx.beginPath()
		this.ctx.rect(this.x, this.y, this.w, this.h)
		this.ctx.closePath()
		this.ctx.fillStyle = this.color
		this.ctx.fill()
	}
}
class Goal {
	constructor(side, x, ctx, canvasWidth, canvasHeight) {
		this.h = 200
		this.w = 50
		this.x = x
		this.y = (canvasHeight/2) - (this.h/2)
		this.canvasWidth = canvasWidth
		this.canvasHeight = canvasHeight
		this.side = side
		this.color = 'purple'
		this.ctx = ctx
	}
	draw() {
		this.ctx.beginPath()
		this.ctx.rect(this.x, this.y, this.w, this.h)
		this.ctx.closePath()
		this.ctx.fillStyle = this.color
		this.ctx.fill()
	}
}
class Player {
	constructor(side, id, color, ctx, canvasWidth, canvasHeight) {
		this.w = 50
		this.h = 100
		this.x = this.xStartingPosition()
		this.y = this.yStartingPosition
		this.canvasWidth = canvasWidth
		this.canvasHeight = canvasHeight
		this.speed = 0.3
		this.moveSpeed = 0
		this.color = color
		this.teleEnts = []
		this.teleExts = []
		this.barriers = []
		this.keyState = {}
		this.score = 0
		this.id = id
		this.side = side
		this.ctx = ctx
		this.yStartingPosition = canvasHeight/2 - this.h/2
	}
	xStartingPosition() {
		let xPos;
		if(this.side == 'left') {
			xPos = this.canvasWidth/4 - this.w/2
		}
		if(this.side == 'right') {
			xPos = this.canvasWidth * 0.75 - this.w/2
		}
		return xPos
	}
	input(delta) {
		// Moving all the players based on the keyState info they send
		this.moveSpeed = this.speed * delta
		// Moves left
		if(this.keyState['a'] || this.keyState['ArrowLeft']) {
			this.x -= this.moveSpeed
		}
		// Moves Right
		if(this.keyState['d'] || this.keyState['ArrowRight']) {
			this.x += this.moveSpeed
		}
		// Moves up
		if(this.keyState['w'] || this.keyState['ArrowUp']) {
			this.y -= this.moveSpeed
		}
		// Moves down
		if(this.keyState['s'] || this.keyState['ArrowDown']) {
			this.y += this.moveSpeed
		}
		// Create game elements teleports/barriers
		// Create Tele entrance
		if(this.keyState['q']) {
			this.teleEnts.push(new Tele(this.x, this.y, 50, 'green', ctx))
			if(this.teleEnts.length > 2) {
				// Removes first tele from array if there are too many in array
				this.teleEnts.splice(0, 1)
			}
		}
		// Create Tele exit
		if(this.keyState['e']) {
			this.teleExts.push(new Tele(this.x, this.y, 15, 'red'))
			if(this.teleExts.length > 1) {
				// Removes first from array if there are too many
				this.teleExts.splice(0, 1)
			}
		}
		// Create barrier
		if(this.keyState['r']) {
			if(this.barriers.length > 1) {
				this.barriers.push(new Barrier(this.x, this.y, ctx))
				if(this.barriers.length > 1) {
					// Removes barries if there is already one
					this.barriers.splice(0, 1)
				}
			}
		}
	}
	update() {
		// If players goes off field/canvas they are set back to the edge
		// Left wall
		if(this.x < 0) {
			this.x = 0
		}
		// Right wall
		if(this.x + this.w > this.canvasWidth) {
			this.x = this.canvasWidth - this.w
		}
		// Top Wall
		if(this.y < 0) {
			this.y = 0
		}
		// Bottom wall
		if(this.y + this.h > this.canvasHeight) {
			console.log('bot');
			this.y = this.canvasHeight - this.h
		}
	}
	reset() {
		this.x = this.xStartingPosition()
		this.y = this.yStartingPosition
	}
	draw() {
		this.ctx.beginPath()
		this.ctx.rect(this.x, this.y, this.w, this.h)
		this.ctx.closePath()
		this.ctx.fillStyle = this.color
		this.ctx.fill()
	}
}
class Tele {
	constructor(x, y, r, color, ctx) {
		this.r = r
		this.x = x
		this.y = y
		this.color = this.color
		this.ctx = ctx
	}
	draw() {
		this.ctx.beginPath()
		this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
		this.ctx.closePath()
		this.ctx.fillStyle = this.color
		this.ctx.fill()
	}
}
