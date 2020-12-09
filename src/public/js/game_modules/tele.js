export class Tele {
	constructor(x, y, r, color) {
		this.r = r
		this.x = x
		this.y = y
		this.color = color
	}
	draw(ctx) {
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
		ctx.closePath()
		ctx.fillStyle = this.color
		ctx.fill()
	}
}
