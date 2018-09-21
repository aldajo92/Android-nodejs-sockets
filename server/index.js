const commandLineArgs = require('command-line-args')
var express = require('express');
var app = express();
var SerialPort = require('serialport');
var ip = require('ip');
var events = require('events');
var fs = require("fs");

var createInterface = require('readline').createInterface;

const options = commandLineArgs(
    [
        { name: 'showports', alias: 's', type: Boolean, description: 'Display serial ports.' },
        { name: 'port', alias: 'p', type: String, description: 'Connect to an specific serial port.' }
    ],
    { partial: true }
)

if (options.showports) {
    SerialPort.list(function (err, ports) {
        ports.forEach(function (port) {
            console.log(port.comName);
        });
    });

} else {
    var loadConfig = JSON.parse(fs.readFileSync("config.json"));
    const serialPortBaudRate = loadConfig.baudrate;
    var eventEmitter = new events.EventEmitter();

    var errorport = function (err) {
        if (err) {
            console.log('Error: ', err.message);
            process.exit();
        }
    }

    function initSerialPort(portname) {
        var serialPort = new SerialPort(portname, { baudRate: loadConfig.baudrate }, errorport);

        var lineReader = createInterface({
            input: serialPort
        });

        serialPort.on('open', function () {
            console.log(`${serialPort.path} connected!!!`)
        });

        lineReader.on('line', function (line) {
            eventEmitter.emit('serialport-data', serialPort.path, line.toString());
        });

        return serialPort;
    }

    function initServer() {

        const port = loadConfig.serverport;
        const hostname = ip.address();
        const server = app.listen(port, hostname, () => { console.log(`Listening http://${hostname}:${port}`) });
        const io = require('socket.io').listen(server);

        app.use(express.static('public'));

        app.get('/hello', function (req, res) {
            res.status(200).send("Hello World!");
        });

        app.post('/', (req, res) => { });

        io.on('connection', function (socket) {
            console.log(`Socket ${socket.id} connected...`);

            socket.on('web-message', function (data) {
                io.sockets.emit('web-message', data + " comida");
                console.log(data);
            });

        });

        eventEmitter.on('serialport-data', function (portname, data) {
            io.sockets.emit('web-message', portname+": "+data);
            // console.log(data);
        });
    }

    function initFromConfigSerialPorts() {
        loadConfig.ports.map(function (port) {
            return initSerialPort(port);
        });
    }


    if (options.port) {
        initSerialPort(options.port);
    } else {
        initFromConfigSerialPorts();
    }

    initServer();
}