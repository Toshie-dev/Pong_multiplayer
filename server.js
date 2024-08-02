const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { headers: "*" } });
let s;
let users = [];
let unames = [];
// init(server, io);
let matches = [];
let match = require('./match');



function getSocket(id, socket) {
    matches.forEach((match) => {

        if (match[0].id == id) {
            console.log('id 0 matched');
            match[0].socket = socket;
        }
        if (match[1].id == id) {
            console.log('id 1 matched');
            match[1].socket = socket;
        }
        if (match[0].socket != undefined & match[1].socket != undefined) {
            match[1].socket.emit('l', match[0].id);
            match[0].socket.emit('r', match[1].id);

            match[1].socket.on('posG', (pos) => {
                match[0].socket.emit('posS', pos);
            });
            match[0].socket.on('posG', (pos) => {
                match[1].socket.emit('posS', pos);
            });
            match[1].socket.on('b', (pos) => {
                match[0].socket.emit('bp', pos);
            });
            match[0].socket.on('disconnect', () => {
                match[0].socket.disconnect();
                match[1].socket.disconnect();
            });
            match[1].socket.on('disconnect', () => {
                match[0].socket.disconnect();
                match[1].socket.disconnect();
            });
            match[1].socket.on('over', (player) => {
                match[0].socket.emit('win', player);
                console.log('over');
            });
            match[0].socket.on('over', (player) => {
                match[1].socket.emit('win', player);
                console.log('over');
            });

        }
    })
}

function delSocket(id) {
    matches.forEach((match) => {
        if (match[0].id == id) {
            match[0].socket = null;
        }

        if (match[1].id == id) {
            match[1].socket = null;
        }
    });
}


io.on('connection', (socket) => {
    console.log(socket.handshake.headers.m);
    if (socket.handshake.headers.m == 0) {
        users.push(socket);
        socket.on('disconnect', () => {
            socket.disconnect();
            io.emit('left', socket.handshake.headers.id);
            for (let i = 0; i < users.length; i++) {
                if (users[i] == socket) {
                    users.splice(i, 1);
                }
            }
        });

        socket.on('invite', (id) => {
            users.forEach((user) => {
                if (user.handshake.headers.id == id) {
                    user.emit('invite_req', socket.handshake.headers.id);
                }
            });
        })

        socket.on('accept', (id) => {
            console.log(`${socket.handshake.headers.id} accepted :${id}`);
            matches.push([{ id: socket.handshake.headers.id, socket: undefined }, { id: id, socket: undefined }])
            users.forEach((user) => {
                if (user.handshake.headers.id == id) {
                    user.emit('init');
                }
            })
        });
    } else {

        getSocket(socket.handshake.headers.id, socket);
    }
});

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/match', match);
app.get('/', (req, res) => {

    if (req.query.s == 1) {
        res.render('user', { s: 1 });
    } else {
        res.render('user', { s: 0 });
    }
});

app.post('/dashboard', (req, res) => {
    let unique = true;
    for (let name of unames) {
        if (req.body.id == name) {
            unique = false
            break;
        }
    }
    if (unique) {
        res.render('dashboard', { users, id: req.body.id });
        io.emit('new', { id: req.body.id });
        unames.push(req.body.id);
    } else {
        res.redirect('http://localhost:8000/?s=1')
    };
});


app.get('/dashboard', (req, res) => {
    res.render('dashboard', { users });
});

server.listen(8000, () => console.log('app listening at port 8000'));