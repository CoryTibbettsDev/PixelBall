import { ctx } from '../gameclient.js'

export class Barrier {
    constructor(x, y) {
        this.h = 100
        this.w = 3
        this.x = x
        this.y = y
        this.color = 'blue'
    }
    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}