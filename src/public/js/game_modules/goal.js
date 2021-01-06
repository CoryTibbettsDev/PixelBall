export class Goal {
	constructor(side, canvasWidth, canvasHeight) {
		this.side = side
		this.canvasWidth = canvasWidth
		this.canvasHeight = canvasHeight
		this.h = 200
		this.w = 50
		this.x = this.xStartingPosition()
		this.y = (canvasHeight/2) - (this.h/2)
		this.color = 'purple'
	}
	xStartingPosition() {
		let x
		if (this.side == 'left') {
			x = 0
		} else {
			x = this.canvasWidth - this.w
		}
		return x
	}
	draw(ctx) {
		ctx.beginPath()
		ctx.rect(this.x, this.y, this.w, this.h)
		ctx.closePath()
		ctx.fillStyle = this.color
		ctx.fill()
	}
}
