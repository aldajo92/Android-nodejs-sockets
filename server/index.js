const commandLineArgs = require('command-line-args')
var express = require('express');
var app = express();
var SerialPort = require('serialport');
var ip = require('ip');
var events = require('events');
var fs = require("fs");

const options = commandLineArgs(
  [
    { name: 'showports', alias: 's', type: Boolean, description: 'Display serial ports.' },
    { name: 'port', alias: 'p', type: String, description: 'Connect to an specific serial port.' }
  ],
  { partial: true }
)

if( options.showports ){
    SerialPort.list(function (err, ports) {
        ports.forEach(function(port) {
            console.log(port.comName);
        });
    });

} else {
    var loadConfig = JSON.parse(fs.readFileSync("config.json"));
    const serialPortBaudRate = loadConfig.baudrate;
    var eventEmitter = new events.EventEmitter();

    var errorport = function(err){
        if (err) {
                console.log('Error: ', err.message);
                process.exit();
        }
    }

    function initSerialPort(portname){
        var serialPort = new SerialPort(portname, { baudRate: loadConfig.baudrate }, errorport);

        serialPort.on('open', function() {
            console.log(`${ serialPort.path } connected!!!`)
        });

        serialPort.on('data', function (data) {
            eventEmitter.emit('serialport-data', serialPort.path, data.toString());
        });

        return serialPort;
    }

    function initServer() {

        const port = loadConfig.serverport;
        const hostname = ip.address();
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

        });

        eventEmitter.on('serialport-data', function (portname, data){
            var formatted = data.replace(/      /g, "");

            formatted = formatted.replace(/ kg /g,":");
            values = formatted.split("\r\n");

            var gross_data = values[0].split(":")[0]
            var tare_data = values[1].split(":")[0]
            var net_data = values[2].split(":")[0]

            var datamodel = {
                portname: portname,
                gross: gross_data,
                tare: tare_data,
                net: net_data
            };

            io.sockets.emit('android-message', datamodel);
            console.log(datamodel);
        });
    }

    function initFromConfigSerialPorts(){
        loadConfig.ports.map(function(port){
            return initSerialPort(port);
        });
    }


    if ( options.port ){
        initSerialPort(options.port);
    } else {   
        initFromConfigSerialPorts();
    }

    initServer();

}