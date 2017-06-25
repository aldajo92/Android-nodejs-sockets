// based on https://carlosazaustre.es/blog/websockets-como-utilizar-socket-io-en-tu-aplicacion-web/

var express = require('express');
var app = express();  

const port = 8080;
const hostname = '192.168.1.15';

var messages = [{  
  id: 1,
  text: "Hola soy un mensaje",
  author: "Carlos Azaustre"
}];

function initServer() {
    const server = app.listen(port, hostname, () => { console.log(`Listening http://${hostname}:${port}`) });
    const io = require('socket.io').listen(server);

    app.use(express.static('public'));

    app.get('/hello', function(req, res) {  
      res.status(200).send("Hello World!");
    });

    app.get('/', (req, res) => { res.send('Hello world!') });
    app.post('/', (req, res) => {});

    io.on('connection', function(socket) {  
        console.log('Alguien se ha conectado con Sockets');
        socket.emit('messages', messages);

        socket.on('new-message', function(data) {
            messages.push(data);
            io.sockets.emit('messages', messages);
            console.log(data);
        });

    });
    
}

initServer();