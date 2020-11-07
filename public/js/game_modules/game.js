export let game = {
    // Important time variables
    timestamp: 0,
    oldTimestamp: 0,
    delta: 0,

    canvas: {
        width: 1600,
        height: 900
    },

    players: [],
    goals: [],
    balls: [],
    begin: function() {},
}

game.setBegin = function(fun) {
    game.begin = fun || game.begin;
    return this;
}

// Init game.ctx as empty variable so we reference here
// but gets changed at client so we can actually draw stuff
let ctx;
game.ctx = ctx

game.Ball = class Ball {
    constructor() {
        this.r = 15;
        this.x = game.canvas.height/2;
        this.y = game.canvas.width/2;
        this.speed = 0.2;
        this.randomDirection = () => {
            // Outputs -1 or 1 so we get random direction for the ball everytime
            // then multiplied by speed of ball for the x/y velocity
            let randomDirection = ((Math.round(Math.random()) * 2 - 1) * this.speed)
            return randomDirection
        }
        this.xvel = this.randomDirection()
        this.yvel = this.randomDirection()
        this.color = 'black';
        // this.move = function(delta) {
        //     console.log(this.x);
        //     this.x += this.xvel * delta
        //     this.y += this.yvel * delta
        // }
    }
    move(delta) {
        this.x += this.xvel * delta
        this.y += this.yvel * delta
    }
    reset() {
        // Set ball to center
        this.x = game.canvas.width/2;
        this.y = game.canvas.height/2;
        // Random ball direction
        this.xvel = this.randomDirection()
        this.yvel = this.randomDirection()
    }
    update() {
        // Collision detection and other update functions here
        // Needs to be called after move in the game update function later
        // Naturally called before draw in game update function but that is
        // important too

        // Need arrow function so this isn't redefined to global scope
        // when called
        let instersectGoal = (goalArray) => {
            for (let i of goalArray) {
                if (this.x + this.r > i.x && // Left
                    this.x - this.r < i.x + i.w && //Right
                    this.y + this.r > i.y && // Top
                    this.y - this.r < i.y + i.h) {
                    // for (let j of players) {
                    //     if (i.side == j.side) {
                    //         j.score++
                    //         // Can check if score is big enough to win here
                    //     }
                    // }
                    game.goalReset()
                }
            }
        }
        instersectGoal(game.goals)

        // Need arrow function so this isn't redefined to global scope
        // when called
        let instersectTele = (playerArray) => {
            for (let i of playerArray) {
                for (let j of i.teleEnts) {
                    // Circle circle collision pythag all over it
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
        instersectTele(game.players)

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
        intersectBarrier(game.players)

        // Bounce ball off wall
        // Sets x/y to edge of canvas then reverses direction
        // Left wall
        if (this.x - this.r < 0) {
            this.x = 0 + this.r
            this.xvel = this.xvel * -1
        }
        // Right wall
        if (this.x + this.r > game.canvas.width) {
            this.x = game.canvas.width - this.r
            this.xvel = this.xvel * -1
        }
        // Top wall
        if (this.y - this.r < 0) {
            this.y = 0 + this.r
            this.yvel = this.yvel * -1
        }
        // Bottom wall
        if (this.y + this.r > game.canvas.height) {
            this.y = game.canvas.height - this.r
            this.yvel = this.yvel * -1
        }
    }
    draw() {
        game.ctx.beginPath();
        game.ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        game.ctx.fillStyle = this.color;
        game.ctx.fill();
        game.ctx.closePath();
    }
}
game.Barrier = class Barrier {
    constructor(x, y) {
        this.h = 100
        this.w = 3
        this.x = x
        this.y = y
        this.color = 'blue'
    }
    draw() {
        game.ctx.beginPath();
        game.ctx.rect(this.x, this.y, this.w, this.h);
        game.ctx.fillStyle = this.color;
        game.ctx.fill();
        game.ctx.closePath();
    }
}

game.Goal = class Goal {
    constructor(side, x) {
        this.h = 200
        this.w = 50
        this.x = x
        this.y = (game.canvas.height/2) - (this.h/2)
        this.side = side
        this.color = 'purple'
    }
    draw() {
        game.ctx.beginPath();
        game.ctx.rect(this.x, this.y, this.w, this.h);
        game.ctx.fillStyle = this.color;
        game.ctx.fill();
        game.ctx.closePath();
    }
}

game.Player = class Player {
    constructor(side, id) {
        this.w = 50;
        this.h = 100;
        this.x = game.canvas.width/2 - this.w/2;
        this.y = game.canvas.height/2 - this.h/2;
        this.speed = 0.3;
        this.color = 'lightblue';
        this.teleEnts = [];
        this.teleExts = [];
        this.barriers = []
        this.keyState = {}
        this.side = side
        this.id = id
        this.score = 0
        this.draw = function() {
            game.ctx.beginPath();
            game.ctx.rect(this.x, this.y, this.w, this.h);
            game.ctx.fillStyle = this.color;
            game.ctx.fill();
            game.ctx.closePath();
        }
        this.move = function(delta) {
            // Moving all the players based on keyState array info they sent
            // Moves left
            if (this.keyState['a'] || this.keyState['ArrowLeft']) {
                this.x -= this.speed * delta
            }
            // Moves right
            if (this.keyState['d'] || this.keyState['ArrowRight']) {
                this.x += this.speed * delta
            }
            // Moves up
            if (this.keyState['w'] || this.keyState['ArrowUp']) {
                this.y -= this.speed * delta
            }
            // Moves down
            if (this.keyState['s'] || this.keyState['ArrowDown']) {
                this.y += this.speed * delta
            }
        }
    }
    reset() {
        if (this.side == 'left') {
            this.x = game.canvas.width/4 - this.w/2;
            this.y = game.canvas.height/2 - this.h/2;
        }
        if (this.side == 'right') {
            this.x = ((game.canvas.width/4) * 3) - this.w/2;
            this.y = game.canvas.height/2 - this.h/2;
        }
    }
}

game.Tele = class Tele {
    constructor(x, y, r, color) {
        this.r = r;
        this.x = x
        this.y = y
        this.color = color
        this.draw = function() {
            game.ctx.beginPath();
            game.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            game.ctx.fillStyle = this.color;
            game.ctx.fill();
            game.ctx.closePath();
        }
    }
}

game.createGamePieces = function() {
    // Creating the permanant game elements
    game.goals.push(new game.Goal('left', 0))
    game.goals.push(new game.Goal('right', game.canvas.width - 50 /* < Goal Width */))
    // Hard coded goal width need better solution
    game.balls.push(new game.Ball())
}
game.goalReset = function() {
    for (let i = 0; i < game.balls.length; i++) {
        game.balls[i].reset();
    }
    for (let i = 0; i < game.players.length; i++) {
        game.players[i].reset();
    }
}
// Loop through array to run functions for all the players
game.inputPlayers = function() {
    for (let i = 0; i < game.players.length; i++) {
        game.players[i].input();
    }
}
game.updatePlayers = function() {
    for (let i = 0; i < game.players.length; i++) {
        game.players[i].move();
    }
}
game.moveBalls = (delta) => {
    for (let i = 0; i < game.balls.length; i++) {
        game.balls[i].move(delta);
    }
}
game.updateBalls = () => {
    for (let i = 0; i < game.balls.length; i++) {
        game.balls[i].update();
    }
}
game.drawBalls = function() {
    for (let i = 0; i < game.balls.length; i++) {
        game.balls[i].draw();
    }
}

game.drawPlayers = function() {
    for (let i = 0; i < game.players.length; i++) {
        game.players[i].draw();
        // Loop within loop to loop through players and then loop through
        // the arrays associated with each player
        // So we can draw the things associated with them
        for (let j = 0; j < game.players[i].teleEnts.length; j++) {
            game.players[i].teleEnts[j].draw()
        }
        for (let j = 0; j < game.players[i].teleExts.length; j++) {
            game.players[i].teleExts[j].draw()
        }
        for (let j = 0; j < game.players[i].barriers.length; j++) {
            game.players[i].barriers[j].draw()
        }
    }
}
// Loop through array to run functions for all the goals
game.drawGoals = function() {
    for (let i = 0; i < game.goals.length; i++) {
        game.goals[i].draw()
    }
}

// Import loop functions
game.update = (delta) => {
    // Movement and update functions go here
    // game.updatePlayers();
    game.moveBalls(delta);
    game.updateBalls();
}
// Draws all the shit we see on screen
game.draw = () => {
    // Clear screen
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    // Draw everything
    game.drawPlayers();
    game.drawBalls();
    game.drawGoals()
}

game.clientLoop = (timestamp) => {
    // Delta is NaN for first couple runs of loop which screws up calculations
    // so set delta = to || 16.67 so it is always equal to a real number and
    // does not screw up anything be multiplied by it
    game.delta = timestamp - game.oldTimestamp || 16.67
    game.oldTimestamp = timestamp

    // Set function with game.setBegin
    // Function for processing input and other things that need to happen
    // before update and draw
    game.begin()

    game.update(game.delta)

    // Draw function goes here after update very important
    game.draw()

    window.requestAnimationFrame(game.clientLoop)

    // Set function with game.setEnd
    // May need this later
    // game.end()
}
game.startClientLoop = () => {
    game.clientLoop()
}

game.serverLoop = () => {
    game.delta = game.timestamp - game.oldTimestamp
    game.oldTimestamp = game.timestamp

    // Set function with game.setBegin
    // Function for processing input and other things that need to happen
    // before update and draw
    game.begin()

    game.update(game.delta)

    // Set function with game.setEnd
    // May need this later
    // game.end()

    game.timestamp = Date.now()
}
game.startServerLoop = () => {
    game.timestep = Date.now()
    game.oldTimestep = Date.now()

    setInterval(game.serverLoop, 1000/60)
}
