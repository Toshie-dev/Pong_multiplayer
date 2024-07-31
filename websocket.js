let temp = [];
let counter = 0;
let match = [];
let io;
const router = require('express').Router();


function init(http, s_io) {
    io = s_io(http, { cors: { headers: "*" } });
    io.on('connection', (socket) => {
        // console.log('connected');
        // temp.push(socket);
        // counter++;
        // play();
        socket.emit('new', { id: usr.id });
    });


    function play() {
        if (counter == 2) {
            counter = 0;

            let p1 = temp.pop();
            let p2 = temp.pop();

            p1.emit('l');
            p2.emit('r');

            p1.on('posG', (pos) => {
                p2.emit('posS', pos);
            });
            p2.on('posG', (pos) => {
                p1.emit('posS', pos);
            });


            let m = { x: p1, y: p2 };
            match.push(m);
        }
    }

}


module.exports = init;