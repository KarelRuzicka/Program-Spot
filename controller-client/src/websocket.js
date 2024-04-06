/**
 * Module to handle WebSocket communication with the server.
 */

const escapeChar = '|';
const address = 'ws://'+location.hostname+':8000';
const msgTimeout = 30000;

console.log('ws://'+location.hostname+':8000');

let ws;
let connectState = "disconnected";
let connected = false;
let responseResolver;

/**
 * Setup the WebSocket connection.
 */
function setupWs() {

  window.interruption = false;

  ws = new WebSocket(address);

  ws.onmessage = function(event) {
    console.debug("WebSocket message received:", event);
  
    if (event.data == "READY") {
      connectState = "running";
      updateButton();
      document.querySelector('#disconnectButton').style.display = 'block';
      runCode();
      return;
    } else if (event.data === "WAITING") {
      connectState = "waiting";
      updateButton();
      document.querySelector('#disconnectButton').style.display = 'block';
      return;
    }
    
    if (responseResolver) {
      responseResolver(event.data);
      responseResolver = null;
    }
  };

  ws.onclose = function () {
    console.log("Disconnected");
    if (connected == true) {
      disconnected();

      try {
        window.interruption = true;
        window.commandInterrupt();
      } catch (error) {
      }
    }
  }
}

const timeout = (ms) => new Promise((resolve, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
const interrupt = () => new Promise((resolve, reject) => window.commandInterrupt = () => {reject(new Error('Code interrupt'));});
window.interruption = false;

/**
 * Send a command to the server.
 */
window.sendCommand = (command, ...args) => {

  if (connected === false) {
    return 
  }

  const message = [command, ...args].join(escapeChar);
  ws.send(message);

  // Wait for response or timeout
  return Promise.race([
    new Promise((resolve) => {
      responseResolver = resolve;
    }),
    timeout(msgTimeout),
    interrupt(),
  ]);

}


const buttonTexts = {
  disconnected: '<i class="fas fa-play"></i> Spustit',
  connecting: '<i class="fas fa-sync"></i> Připojuji',
  waiting: '<i class="fas fa-user-clock"></i> Ve frontě',
  running: '<i class="fas fa-cogs"></i> Běží',
  error: '<i class="fas fa-exclamation-triangle"></i> Chyba',
};

document.querySelector('#runButton').addEventListener('click', (e) => {
  if(connectState == "disconnected") {
      connectState = "connecting";
      updateButton();
      setupWs();
      connected = true;
  }
});

document.querySelector('#disconnectButton').addEventListener('click', (e) => {
  if(connectState === "running") {
    try {
      window.interruption = true;
      window.commandInterrupt();
    } catch (error) {
    }
  }else{
    ws.close();
  }
});


function updateButton(){
  let button = document.querySelector('#runButton');

  button.setAttribute('state', connectState);
  button.innerHTML = buttonTexts[connectState];

}

window.commandError = () => {
  if (window.interruption) {
    disconnected();
  } else {
    disconnected("error");
    setTimeout(() => {
      disconnected();
    }, 3000);
  }
}

window.commandSuccess = () => {
  disconnected();
}

function disconnected(state = "disconnected"){
  document.querySelector('#disconnectButton').style.display = 'none';
  connectState = state;
  updateButton()
  connected = false;
  if (ws.readyState !== WebSocket.CLOSED) {
    ws.close();
  }
}

updateButton();

