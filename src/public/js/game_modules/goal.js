export class Goal {
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
