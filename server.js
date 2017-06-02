const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// parse application/json
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 7312;
const dataDir = process.env.DATA_DIR || 'data/';
const password = process.env.PASSWORD || 'game_live';

var tour = 0;

app.get('/api', function(req, res) {
    res.send({name:'Game Live', version: '1.0'});
});

/**
 * BOARD
 */

// Récupération du board
app.get('/api/board', function(req, res) {
    res.sendFile(__dirname + '/data/board.js');
});

// Reset du jeu
app.put('/api/evt', function (req, res) {
    var data = req.body;
    if (data.securitycheck == password) {
        console.log('send event to clients')
        io.of('/live').emit('event', JSON.stringify(data.message));
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

// Reset du jeu
app.post('/api/reset', function (req, res) {
    var data = req.body;
    if (data.securitycheck == password) {
        tour = 0;
        io.in('/live').emit('event', JSON.stringify({type: 'reset'}));
    } else {
        res.sendStatus(401);
    }
});

io.of('/live').on("connection", function(socket){
    console.log('new ws connection: ' + socket.client.request.url + ' -> ' + socket.client.conn);
    socket.on('event', function(data){
        console.log('received: %s', data);
    });
    socket.on('disconnect', function(){});
});

/**
 * LANCEMENT DU SERVEUR
 */
server.listen(port, function () {
    console.log('Game server listening on port ' + port);
});
