export let canvas = {}
canvas.width = 1600
canvas.height = 900
export let ctx, goalReset, delta
export let goals = []
export let players = []
export let balls = []
export let timestamp = 0
export let oldTimestamp = 0
export let timestep = 1000/60
