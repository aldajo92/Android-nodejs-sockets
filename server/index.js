// based on https://carlosazaustre.es/blog/websockets-como-utilizar-socket-io-en-tu-aplicacion-web/
const commandLineArgs = require('command-line-args')
var express = require('express');
var app = express();
var SerialPort = require('serialport');
var ip = require('ip');
var events = require('events');

const options = commandLineArgs(
  [
    { name: 'showports', alias: 's', type: Boolean, description: 'Display serial ports.' },
    { name: 'port', alias: 'p', type: String, description: 'connect serial ports.' }
  ],
  { partial: true }
)

if( options.showports ){

    SerialPort.list(function (err, ports) {
        ports.forEach(function(port) {
            console.log(port.comName);
        });
    });

}

if ( options.port ){

    const port = 8080;
    const hostname = ip.address();
    const serialPortName = options.port;
    const serialPortBaudRate = 9600;

    var eventEmitter = new events.EventEmitter();

    function initSerialPort(){
        var errorport = function(err){
          if (err) {
                  console.log('Error on write: ', err.message);
                  process.exit();
          }
        }

        var serialPort1 = new SerialPort(serialPortName, { baudRate: serialPortBaudRate }, errorport);

        serialPort1.on('open', function() {
            console.log(`${ serialPort1.path } connected!!!`)
        });

        serialPort1.on('data', function (data) {
            eventEmitter.emit('seriaport-data', data);
        });
    }

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
            console.log(`Socket ${socket.id} connected...`);

            socket.on('web-message', function(data) {
                io.sockets.emit('android-message', data);
                console.log(data);
            });

            eventEmitter.on('seriaport-data', function (data){
                console.log(data);
            });

        });
    }

    initSerialPort();
    initServer();

}