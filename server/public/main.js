var socket = io.connect('http://192.168.1.14:8090', { 'forceNew': true });

socket.on('messages', function(data) {  
  console.log(data);
  render(data);
})

function render (data) {  
  var html = data.map(function(elem, index) {
    return(`<div>
              <strong>${elem.author}</strong>:
              <em>${elem.text}</em>
            </div>`);
  }).join(" ");

  document.getElementById('messages').innerHTML = html;
}

function addMessage(e) {  
  var message = document.getElementById('texto').value;

  socket.emit('web-message', message);
  return false;
}
