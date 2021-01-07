export class Barrier {
	constructor(x, y, color) {
		this.h = 100
		this.w = 2
		this.x = x
		this.y = y
	}
	draw(ctx, color) {
		ctx.beginPath()
		ctx.rect(this.x, this.y, this.w, this.h)
		ctx.closePath()
		ctx.fillStyle = color
		ctx.fill()
	}
}
