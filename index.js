const http = require('http')
const fs = require('fs')
const port = 3000
const path = require('path')

// Setting up server
// Creates server and gets request and response paramters
const server = http.createServer((req, res) => {
    // Adds public to requested URL so we have right file path
    let filePath = './public' + req.url;

    // Default page for visitor calling directly URL
    if (filePath == './public/') {
        filePath = './public/index.html';
    }
        
    let extname = path.extname(filePath);
    let contentType = 'text/html';

    // Sets content type to the requested files extension
    switch (extname) {
        case '.js':
            contentType = 'application/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }

    // Sets heads for response work out some of this later
    let headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000, // 30 days
        'Content-Type': contentType
    };

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('public/404.html', function(error, content) {
                    res.writeHead(404, headers);
                    res.end(content, 'utf-8');
                });
            } else {
                fs.readFile('public/500.html', function(error, content) {
                    res.writeHead(500, headers);
                    res.end(content, 'utf-8');
                });
            }
        }
        else {
            res.writeHead(200, headers);
            res.end(content, 'utf-8');
        }
    });

    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
    }
})

// Sets server to listen on set port
// could append .listen to create server if we want
// This way allows us to display errors and confirmation server started
server.listen(port, (error) => {
    if (error) {
        console.log('Something went wrong ' + error);
    } else {
        console.log('Server is listening on port ' + port);
    }
})

module.exports = { server }

let gameserver = require('./gameserver')
gameserver.playerConnect()