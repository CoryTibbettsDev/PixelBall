export class Tele {
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
