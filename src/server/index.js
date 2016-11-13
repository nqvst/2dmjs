import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import config from './config.json';
import socketIO from 'socket.io';
import uuid from 'node-uuid';

let app = express();
app.server = http.createServer(app);

const io = socketIO(app.server);

// 3rd party middleware
app.use(cors({
    exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
    limit : config.bodyLimit
}));

app.use(express.static('src/client'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});

function onPlayerJoined(socket, data) {
    socket.broadcast.emit('message', {
        type: 'join',
        data,
    });
}

function onPlayerLeft(socket, data) {
    socket.broadcast.emit('message', {
        type: 'disconnect',
        data,
    });
}

function onPlayerPosition(socket, data) {
    socket.broadcast.emit('message', {
        type: 'position',
        data,
    });
}

let players = [];

io.on('connection', (socket) => {

    console.log('a user connected', socket.id);
    players.push({ 
        id: socket.id
    });

    players.forEach(p => {
        console.log('players.forEach', p);

        if(socket.id !== p.id ) {
            socket.emit('message', {
                type: 'join',
                data: p,
            });
        }
    });

    socket.on('message', (msg) => {
        const { type, data } = msg;

        switch(type) {
            case 'position':
                onPlayerPosition(socket, data);
                break;
            case 'join':
                onPlayerJoined(socket, data);
                break;
            default:
                console.warn('default:', msg)
        }
    });  

    socket.on('disconnect', (evt) => {
        console.log('user disconnected', evt);
        players = players.filter(p => p.id !== socket.id);
        console.log('user disconnected');
        onPlayerLeft(socket, { id: socket.id });
    });
});


app.server.listen(process.env.PORT || config.port);
console.log(`Started on port ${app.server.address().port}`);


export default app;
