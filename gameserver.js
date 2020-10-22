const index = require('./index')

// Need to pass in server so socket can connect to front-end/client
const io = require('socket.io')(index.server)

// Game elements
class Ball {
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
            this.x = canvas.width - ball.r
            this.xvel = this.xvel * -1
        }
        // Top wall
        if (this.y - this.r < 0) {
            this.y = 0 + this.r
            this.yvel = this.yvel * -1
        }
        // Bottom wall
        if (this.y + this.r > canvas.height) {
            this.y = canvas.height - ball.r
            this.yvel = this.yvel * -1
        }
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
}
class Player {
    constructor(side, id) {
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
        this.score = 0
        this.side = side
        this.id = id
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
    move() {
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
class Tele {
    constructor(x, y, r, color) {
        this.r = r;
        this.x = x
        this.y = y
        this.color = color
    }
}

// Defining serverside canvas size because it is messy to access
// Have to edit things on front and back-end when change is made unfortunatelys
let canvas = {}
canvas.width = 2000
canvas.height = canvas.width/2

// Defining important time based variables
let delta = 0
let timestamp = 0
let oldTimestamp = 0
let timestep = 1000/60

function goalReset() {
    ball.reset()

    for (let i = 0; i < players.length; i++) {
        players[i].reset();
    }
}

// Loop through array to run functions for all the players
function updatePlayers() {
    for (let i = 0; i < players.length; i++) {
        // Moving all the players based on keyState array info they sent
        players[i].move();
    }
}

// Creating the permanant game elements maybe put in setup() function later
let ball = new Ball();

let goals = []
goals.push(new Goal('left', 0))
goals.push(new Goal('right', canvas.width - 50)) // Hard coded goal width b/c idk how to reference Goal.w property here

let players = [];

// Wrap connection listener in enclosing function so I can export
function playerConnect() {
    // Stuff happens on connection to socket
    // Apparently can say io.on() or io.sockets.on()
    io.on('connection', socket => {
        console.log('got a new connection from: ' + socket.id);
        socket.join('game')

        // Gets the room of our game so we can see sockets attached to the room and it's length
        let room = io.sockets.adapter.rooms['game'];
        // Create players on connection
        if (room.length == 1) {
            players.push(new Player('left', socket.id))
        } else if (room.length == 2) {
            players.push(new Player('right', socket.id))
            // Send out players array and starts game on client and server
            io.to('game').emit('start', players)
            startServerMainLoop()
            console.log('started');
        } else {
            console.log('too many players');
        }

        // Recieving keyState and what we do with it
        /* socket.on('send keyState', setKeyState)
        function setKeyState(keyState) {
            for(let i = 0; i < players.length; i++) {
                if (players[i].id = keyState.id) {
                    players[i].keyState = keyState.keyState
                }
            }
        } */
    });
}

module.exports = { playerConnect }

// Update all the positions and actions of the stuff we draw
function update(delta) {
    // Movement and update functions go here
    updatePlayers();

    ball.move();

    ball.update()
}

function panic() {
    console.log('Panic!');
    delta = 0
}

// Initialize variable so we can update and use in the game loop
let gameInfo = {}

// Wrap mainLoop in enclosing function so we can start the mainLoop when we want
function startServerMainLoop() {
    timestamp = Date.now()
    oldTimestamp = Date.now()

    let numUpdateSteps = 0
    function mainLoop() {
        delta += timestamp - oldTimestamp // Need += here
        oldTimestamp = timestamp

        // Simulate the total elapsed time in fixed-size chunks
        numUpdateSteps = 0
        while (delta >= timestep) {
            update(timestep)
            delta -= timestep

            // Panic if too many updates have happened
            numUpdateSteps++
            if (numUpdateSteps >= 240) {
                panic();
                break;
            }
        }

        // Define & send out game information
        gameInfo = {
            ball: ball,
            players: players
        }
        io.to('game').emit('server update', gameInfo)

        timestamp = Date.now()
    }
    setInterval(mainLoop, timestep)
}
