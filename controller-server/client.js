var ws = new WebSocket('ws://location.host:8000');
ws.onopen = function () {
  ws.send('Ping'); // Send the message 'Ping' to the server
};

let done = false;

ws.onmessage = function(event) {
  console.debug("WebSocket message received:", event);
  done = true;
};


while (!done){
  StyleProp
}

console.log("done");






/*
// Vytvořit funkci, která vrátí Promise objekt
function waitForMessage() {
  return new Promise((resolve, reject) => {
    // Nastavit funkci, která se spustí při přijetí zprávy
    ws.onmessage = function(event) {
      // Vyřešit Promise s přijatou zprávou
      resolve(event.data);
    };
  });
}

ws.onopen = function () {
  console.log("hey");
  // Použít async/await syntaxi pro posílání a přijímání zpráv
  (async function() {
    // Poslat první zprávu na server
    ws.send("my_first_message_to_server");
    // Čekat na vyřešení Promise objektu
    var firstResponse = await waitForMessage();
    // Zpracovat první odpověď
    console.log(firstResponse);
    // Poslat druhou zprávu na server
    ws.send("my_second_message_to_server");
    // Čekat na vyřešení Promise objektu
    var secondResponse = await waitForMessage();
    // Zpracovat druhou odpověď
    console.log(secondResponse);

    console.log("done");
  })();
};
*/