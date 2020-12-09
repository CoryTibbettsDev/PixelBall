import { Barrier } from './barrier.js'
import { Tele } from './tele.js'

export class Player {
	constructor(side, id, color, canvasWidth, canvasHeight) {
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
		this.oldKeyState = {}
		this.score = 0
		this.id = id
		this.side = side
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
		if(this.keyState['q'] && !this.oldKeyState['q']) {
			this.teleEnts.push(new Tele(this.x, this.y, 50, 'green'))
			if(this.teleEnts.length > 2) {
				// Removes first tele from array if there are too many in array
				this.teleEnts.splice(0, 1)
			}
		}
		// Create Tele exit
		if(this.keyState['e'] && !this.oldKeyState['e']) {
			this.teleExts.push(new Tele(this.x, this.y, 15, 'red'))
			if(this.teleExts.length > 1) {
				// Removes first from array if there are too many
				this.teleExts.splice(0, 1)
			}
		}
		// Create barrier
		if(this.keyState['r'] && !this.oldKeyState['r']) {
			this.barriers.push(new Barrier(this.x, this.y))
			if(this.barriers.length > 1) {
				// Removes barries if there is already one
				this.barriers.splice(0, 1)
			}
		}
		// Store old keyState
		this.oldKeyState = this.keyState
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
			this.y = this.canvasHeight - this.h
		}
	}
	reset() {
		this.x = this.xStartingPosition()
		this.y = this.yStartingPosition
	}
	draw(ctx) {
		ctx.beginPath()
		ctx.rect(this.x, this.y, this.w, this.h)
		ctx.closePath()
		ctx.fillStyle = this.color
		ctx.fill()
	}
}
