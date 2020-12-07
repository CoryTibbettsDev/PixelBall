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
app.use(express.static('public'))

// Express 404 error response https://expressjs.com/en/starter/faq.html
app.use(function (req, res, next) {
  res.status(404).send('404 error')
})

// Express 500 error response https://expressjs.com/en/starter/faq.html
app.use(function (req, res, next) {
  res.status(500).send('500 error, something broke!')
})

import { playerConnect } from './game_server.js'

playerConnect()
