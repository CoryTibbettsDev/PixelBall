import { canvas, ctx, goals, players, balls, delta } from './game_variables.js'
import { Ball, Barrier, Goal, Player, Tele } from './game_elements.js'

export function createGamePieces() {
    // Creating the permanant game elements
    goals.push(new Goal('left', 0))
    goals.push(new Goal('right', canvas.width - 50 /* < Goal Width */))
    // Hard coded goal width need better solutions
}
export function goalReset() {
    for (let i = 0; i < balls.length; i++) {
        balls[i].reset();
    }
    for (let i = 0; i < players.length; i++) {
        players[i].reset();
    }
}
// Loop through array to run functions for all the players
export function inputPlayers() {
    for (let i = 0; i < players.length; i++) {
        players[i].input();
    }
}
export function updatePlayers() {
    for (let i = 0; i < players.length; i++) {
        players[i].move();
    }
}
export function drawPlayers() {
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
// Loop through array to run functions for all the goals
export function drawGoals() {
    for (let i = 0; i < goals.length; i++) {
        goals[i].draw()
    }
}
export function drawBalls() {
    for (let i = 0; i < balls.length; i++) {
        balls[i].draw();
    }
}
