
const escapeChar = '|';

var ws = new WebSocket('ws://'+location.hostname+':8000');
console.log('ws://'+location.hostname+':8000');
ws.onopen = function () {
  ws.send('move_to|5|6'); // Send the message 'Ping' to the server
};

let responseResolver;

ws.onmessage = function(event) {
  console.debug("WebSocket message received:", event);
  
  if (responseResolver) {
    responseResolver(event.data);
    responseResolver = null;
  }
};

function sendCommand(command, ...args) {
  const message = [command, ...args].join(escapeChar);
  ws.send(message);

  return new Promise((resolve) => {
    responseResolver = resolve;
  });

}







