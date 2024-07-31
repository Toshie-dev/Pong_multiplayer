const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const init = require('./websocket');
const io = require('socket.io')(server, { cors: { headers: "*" } });
let s;
let users = [];
let unames = [];
// init(server, io);


io.on('connection', (socket) => {
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
    });
});

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
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