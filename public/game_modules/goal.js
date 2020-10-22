import { canvas, ctx } from '../gameclient.js'

export class Goal {
    constructor(side, x) {
        this.h = 200
        this.w = 50
        this.x = x
        this.y = (canvas.height/2) - (this.h/2)
        this.side = side
        this.color = 'purple'
    }
    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}