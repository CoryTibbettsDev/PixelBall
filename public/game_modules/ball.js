import { canvas, ctx, goals, players, goalReset, delta } from '../gameclient.js'

export class Ball {
    constructor() {
        this.r = 15;
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.speed = 0.2;
        // Outputs -1 or 1 so we get random direction for the ball everytime
        this.xvel = (Math.round(Math.random()) * 2 - 1) * this.speed
        this.yvel = (Math.round(Math.random()) * 2 - 1) * this.speed
        this.color = 'black';
    }
    reset() {
        // Set ball to center
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        // Random ball direction
        this.xvel = (Math.round(Math.random()) * 2 - 1) * this.speed
        this.yvel = (Math.round(Math.random()) * 2 - 1) * this.speed
    }
    move() {
        this.move = function() {
            this.x += this.xvel * delta
            this.y += this.yvel * delta
        }
    }
    update() {
        // Collision detection and other update functions here
        // Needs to be called after move in the game update function later
        // Naturally called before draw in game update function but that is important too

        // Need arrow function so this isn't redefined to global scope when called
        let instersectGoal = (goalArray) => {
            for (let i of goalArray) {
                if (this.x + this.r > i.x && // Left
                    this.x - this.r < i.x + i.w && //Right
                    this.y + this.r > i.y && // Top
                    this.y - this.r < i.y + i.h) {
                    for (let j of players) {
                        if (i.side == j.side) {
                            j.score++
                            // Can check if score is big enough to win here
                        }
                    }
                    goalReset()
                }
            }
        }
        instersectGoal(goals)

        // Need arrow function so this isn't redefined to global scope when called
        let instersectTele = (playerArray) => {
            for (let i of playerArray) {
                for (let j of i.teleEnts) {
                    // Circle circle collision pythag all over it like chicken pox
                    let distX = this.x - j.x
                    let distY = this.y - j.y
                    let distance = Math.sqrt((distX * distX) + (distY * distY))
                    if (i.teleExts.length > 0  && distance <= this.r + j.r) {
                        this.x = i.teleExts[0].x
                        this.y = i.teleExts[0].y
                    }
                }
            }
        }
        instersectTele(players)

        let intersectBarrier = (playerArray) => {
            for (let i of playerArray) {
                for (let j of i.barriers) {
                    // Doesn't check which side is closest just collision
                    if (this.x + this.r > j.x &&
                        this.x - this.r < j.x + j.w &&
                        this.y + this.r > j.y &&
                        this.y + this.r < j.y + j.h) {
                        this.xvel = this.xvel * -1
                    }
                }
            }
        }
        intersectBarrier(players)
        

        // Bounce ball off wall
        // Sets x/y to edge of canvas then reverses direction
        // Left wall
        if (this.x - this.r < 0) {
            this.x = 0 + this.r
            this.xvel = this.xvel * -1
        }
        // Right wall
        if (this.x + this.r > canvas.width) {
            this.x = canvas.width - this.r
            this.xvel = this.xvel * -1
        }
        // Top wall
        if (this.y - this.r < 0) {
            this.y = 0 + this.r
            this.yvel = this.yvel * -1
        }
        // Bottom wall
        if (this.y + this.r > canvas.height) {
            this.y = canvas.height - this.r
            this.yvel = this.yvel * -1
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}