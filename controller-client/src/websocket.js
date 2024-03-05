console.log("websocket.js");

var ws = new WebSocket('ws://'+location.hostname+':8000');
ws.onopen = function () {
  ws.send('move_to|5|6'); // Send the message 'Ping' to the server
};

let done = false;

ws.onmessage = function(event) {
  console.debug("WebSocket message received:", event);
  done = true;
};





