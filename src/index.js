import express from 'express'
const app = express()
const port = process.env.PORT || 3000

import http from 'http'
// Creates http server passing in app: the express route handler
// Server now knows how to handle request routes thanks to express
const server = http.createServer(app)
// Sets server to listen on: port
try {
    server.listen(port, () => {
        console.log('Server listening at port', port);
    })
} catch (err) {
    console.error(err)
}

import socket from 'socket.io'
// Need to pass in server so socket can connect to front-end/client
// Need to set io to the imported module so we can pass in the options/paramters
// https://stackoverflow.com/questions/29923879/pass-options-to-es6-module-imports
export const io = socket(server)

// Tells express to server static files from the public folder
// Can put another folder here if we want multiple folders
// They are accessed to look for the file in the order they are declared
// Cannot use __dirname with es6 modules
// https://nodejs.org/api/esm.html#esm_no_filename_or_dirname
app.use(express.static('public'))

// Need absolute filepath for res.sendFile() but cannot use __dirname because
// I am using ES6 modules use this instead
// https://stackoverflow.com/questions/46745014/
// alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
import { dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
// Can do either of these now
// res.sendFile(__dirname + '/index.html');
// res.sendFile('index.html', { root: __dirname });

// Express 404 and 500 error response https://expressjs.com/en/starter/faq.html
app.use(function (req, res, next) {
	res.status(404).sendFile(__dirname + '/public/404.html')
})
app.use(function (req, res, next) {
	res.status(500).sendFile(__dirname + '/public/500.html')
})

import { playerConnect } from './game_server.js'

playerConnect()
