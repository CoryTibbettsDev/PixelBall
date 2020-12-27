export class Ball {
	constructor(canvasWidth, canvasHeight) {
		this.r = 15
		this.x = canvasWidth/2
		this.y = canvasHeight/2
		this.speed = 0.2
		this.color = 'black'
		this.canvasWidth = canvasWidth
		this.canvasHeight = canvasHeight
		this.scored = false
		this.gameEnds = false
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
	update(goalArray, playerArray) {
		this.scored = false;
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
					for(let j of playerArray) {
						if(i.side == j.side) {
							j.score++
							if (j.score >= 3) {
								this.gameEnds = true
							}
							// Can check if score is big enough to win here
						}
					}
					// It sucks but just say ball scored so game object can
					// handle reset
					this.scored = true
				}
			}
		})(goalArray); // Pass in goal array from game object
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
		})(playerArray);
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
		})(playerArray);
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
	draw(ctx) {
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.r, 0, Math.PI*2)
		ctx.closePath()
		ctx.fillStyle = this.color
		ctx.fill()
	}
}
