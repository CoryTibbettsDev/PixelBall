import { ctx } from '../gameclient.js'

export class Tele {
    constructor(x, y, r, color) {
        this.r = r;
        this.x = x
        this.y = y
        this.color = color
        this.draw = function() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }
}