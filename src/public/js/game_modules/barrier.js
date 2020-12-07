export class Barrier {
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
