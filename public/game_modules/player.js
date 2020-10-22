import { canvas, ctx } from '../gameclient.js'

export class Player {
    constructor(side, id) {
        this.w = 50;
        this.h = 100;
        this.x = canvas.width/2 - this.w/2;
        this.y = canvas.height/2 - this.h/2;
        this.speed = 0.3;
        this.color = 'lightblue';
        this.teleEnts = [];
        this.teleExts = [];
        this.barriers = []
        this.side = side
        this.id = id
        this.score = 0
        this.draw = function() {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }
    reset() {
        if (this.side == 'left') {
            this.x = canvas.width/4 - this.w/2;
            this.y = canvas.height/2 - this.h/2;
        }
        if (this.side == 'right') {
            this.x = ((canvas.width/4) * 3) - this.w/2;
            this.y = canvas.height/2 - this.h/2;
        }
    }
}