export class Barrier {
	constructor(x, y) {
		this.h = 100
		this.w = 2
		this.x = x
		this.y = y
		this.color = 'blue'
	}
	draw(ctx) {
		ctx.beginPath()
		ctx.rect(this.x, this.y, this.w, this.h)
		ctx.closePath()
		ctx.fillStyle = this.color
		ctx.fill()
	}
}
