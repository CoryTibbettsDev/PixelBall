// Code bad but I tried to make easy to decipher at least
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Defining important time based variables
let delta = 0
let timestamp = 0
let oldTimestamp = 0
let timestep = 1000/60

// FPS variables
let fpsDisplay = document.getElementById('fpsDisplay')
let fps = 60
let framesThisSecond = 0
let lastFPSUpdate = 0

// Changes canvas size on window resize scales whole canvas
window.addEventListener('resize', setCanvas());
function setCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = canvas.width/2;
}
setCanvas();

function goalReset() {
    ball.reset()

    for (let i = 0; i < players.length; i++) {
        players[i].reset();
    }
}

// Classes with constructors for game elements
class Player {
    constructor(side) {
        this.w = 50;
        this.h = 100;
        this.x = canvas.width/2 - this.w/2;
        this.y = canvas.height/2 - this.h/2;
        this.speed = 0.3;
        this.color = 'lightblue';
        this.teleEnts = [];
        this.teleExts = [];
        this.keyState = [];
        this.barriers = []
        this.side = side
        this.score = 0
        this.input = function() {
            // Need arrow function here so the this keyword doesn't get redifined to global scope when called
            // Changes array to move character more responsive I have found than changing speed on event listener itself
            window.addEventListener('keydown', (k) => {
                // Needs to happen before keystate is update so we know if the key has been pressed or not
                // Create Teles
                if (k.key == 'q' && !this.keyState['q']) {
                    this.teleEnts.push(new Tele(this.x, this.y, 50, 'green'));
                    if (this.teleEnts.length > 2) {
                        // Removes first tele from array if there are too many
                        this.teleEnts.splice(0, 1);
                    }
                }
                if (k.key == 'e' && !this.keyState['e']) {
                    this.teleExts.push(new Tele(this.x, this.y, ball.r, 'red'));
                    if (this.teleExts.length > 1) {
                        // Removes first tele from array if there are too many
                        this.teleExts.splice(0, 1);
                    }
                }
                // Create Barrier
                if (k.key == 'r' && !this.keyState['r']) {
                    this.barriers.push(new Barrier(this.x, this.y))
                    if (this.barriers.length > 1) {
                        this.barriers.splice(0, 1)
                    }
                }


                this.keyState[k.key] = true;
            }, true);
            window.addEventListener('keyup', (k) => {
                this.keyState[k.key] = false;
            }, true);

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
// Loop through array to run functions for all the players
function updatePlayers() {
    for (let i = 0; i < players.length; i++) {
        players[i].input();
    }
}
function drawPlayers() {
    for (let i = 0; i < players.length; i++) {
        players[i].draw();

        // Loop within loop to loop through players and then loop through the arrays associated with each player
        // So we can draw the things associated with them
        for (let j = 0; j < players[i].teleEnts.length; j++) {
            players[i].teleEnts[j].draw()
        }
        for (let j = 0; j < players[i].teleExts.length; j++) {
            players[i].teleExts[j].draw()
        }
        for (let j = 0; j < players[i].barriers.length; j++) {
            players[i].barriers[j].draw()
        }
    }
}


class Ball {
    constructor() {
        this.r = 15;
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.speed = 0.2;
        // Outputs -1 or 1 so we get random direction for the ball everytime
        this.xspeed = (Math.round(Math.random()) * 2 - 1) * this.speed
        this.yspeed = (Math.round(Math.random()) * 2 - 1) * this.speed
        this.color = 'black';
    }
    reset() {
        // Set ball to center
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        // Random ball direction
        this.xspeed = (Math.round(Math.random()) * 2 - 1) * this.speed
        this.yspeed = (Math.round(Math.random()) * 2 - 1) * this.speed
    }
    move() {
        this.move = function() {
            this.x += this.xspeed * delta
            this.y += this.yspeed * delta
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
                        this.xspeed = this.xspeed * -1
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
            this.xspeed = this.xspeed * -1
        }
        // Right wall
        if (this.x + this.r > canvas.width) {
            this.x = canvas.width - ball.r
            this.xspeed = this.xspeed * -1
        }
        // Top wall
        if (this.y - this.r < 0) {
            this.y = 0 + this.r
            this.yspeed = this.yspeed * -1
        }
        // Bottom wall
        if (this.y + this.r > canvas.height) {
            this.y = canvas.height - ball.r
            this.yspeed = this.yspeed * -1
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


class Tele {
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

class Goal {
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
// Loop through array to run functions for all the goals
function drawGoals() {
    for (let i = 0; i < goals.length; i++) {
        goals[i].draw()
    }
}

class Barrier {
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



// Creating the permanant game elements maybe put in setup() function later
let ball = new Ball();

let goals = []
let leftGoal = goals.push(new Goal('left', 0))
let rightGoal = goals.push(new Goal('right', canvas.width - 50)) // Hard coded goal width b/c idk how to reference Goal.w property here

let players = [];
let addPlayer = players.push(new Player('right'));


// Update all the positions and actions of the stuff we draw
function update(delta) {
    // Movement and update functions go here
    updatePlayers();
    
    ball.move();

    ball.update()
}

// Draws all the shit we see on screen
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayers();
    
    ball.draw();

    drawGoals()

    // Display fps
    fpsDisplay.textContent = Math.floor(fps) + ' FPS';
}

function panic() {
    console.log('Panic!');
    delta = 0
}

function mainLoop(timestamp) {
    // Calculating FPS I think should have before we fuck the time calcs
    if (timestamp > lastFPSUpdate + 1000) { // update every second
        fps = framesThisSecond; // Hand off the fps value so we can count with other variable

        lastFPSUpdate = timestamp;
        framesThisSecond = 0;
    }
    framesThisSecond++


    delta += timestamp - oldTimestamp // Need += here
    oldTimestamp = timestamp

    // Simulate the total elapsed time in fixed-size chunks
    while (delta >= timestep) {
        update(timestep)
        delta -= timestep

        // Panic if some
        /* let numUpdateSteps = 0
        ++numUpdateSteps
        if (numUpdateSteps >= 240) {
            panic();
            break;
        } */
    }

    // Draw function goes here after update very important
    draw()

    window.requestAnimationFrame(mainLoop)
}
window.requestAnimationFrame(mainLoop)