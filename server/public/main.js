$(function () {
  var socket = io();
  // var socket = io.connect('http://192.168.1.14:8090', { 'forceNew': true });
  socket.on('web-message', function (msg) {
      $('#messages').append($('<li>').text(msg));
  });
});