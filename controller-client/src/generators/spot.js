/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order } from 'blockly/javascript';


export const forBlock = Object.create(null);

forBlock['starter_block'] = function (block, generator) {
  return "";
}


forBlock['display_value'] = function (block, generator) {

  let value = generator.valueToCode(block, 'VALUE', Order.ATOMIC) || "''";

  return `window.blocklyWs.getBlockById('${block.id}').setFieldValue(${value}, 'DISPLAY');\n`;

};


forBlock['wait'] = function(block, generator) {
  let seconds = generator.valueToCode(block, 'TIME', Order.ATOMIC);
  let code = ``;
  code += `window.blocklyWs.highlightBlock('${block.id}');`;
  code += `await Promise.race([
    new Promise(resolve => setTimeout(resolve, ${seconds} * 1000)),
    new Promise((resolve, reject) => window.commandInterrupt = () => {reject(new Error('Code interrupt'));}),
    ]);`;
  code += `window.blocklyWs.highlightBlock('null');\n`;
  return code;
};

window.pressedKeys = {};
window.onkeyup = function(e) { window.pressedKeys[e.key] = false; }
window.onkeydown = function(e) { window.pressedKeys[e.key] = true; }

forBlock['key_press'] = function(block, generator) {
  let key = block.getFieldValue('KEY');

  let code = ``;
  code += `(function() {`;
  code += `return window.pressedKeys['${key}'] || window.pressedKeys['${key}'.toLowerCase()];`;
  code += `})()`;


  return [code, Order.ATOMIC];
};


//Custom while loop that prevents infinite loops and allows for interruption
forBlock['controls_whileUntil'] = function(block, generator) {
  // While/Until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = generator.valueToCode(block, 'BOOL',
      until ? generator.ORDER_LOGICAL_NOT :
      generator.ORDER_NONE) || 'false';
  var branch = generator.statementToCode(block, 'DO');
  branch = generator.addLoopTrap(branch, block);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '; if(window.interruption == true){break;}; await new Promise(resolve => setTimeout(resolve,  10));}\n';
};


function generateCommand(block, inline=false, returned='string', command, ...args) {

  let code = ``;
  code += `await (async function() {`;

  code += `window.blocklyWs.highlightBlock('${block.id}');`;
  code += `let previouslyHighlighted = window.blocklyHighighted;`;
  code += `window.blocklyHighighted = '${block.id}';`;

  code += `let response = await window.sendCommand('${command}', ${args.join(', ')});`;
  
  code += `window.blocklyWs.highlightBlock(previouslyHighlighted);`;
  code += `window.blocklyHighighted = previouslyHighlighted;`;

  code += `if (response == 'False') { throw new Error('Command failed');}\n`;

  if (returned === 'string') {
    code+= `return response;`;
  } else if (returned === 'integer') {
    code+= `return parseInt(response);`;
  } else if (returned === 'float') {
    code+= `return parseFloat(response);`;
  }

  code += `})()`;

  if (inline) {
    code += `;\n`;
  }

  return code;
}


forBlock['move_to'] = function (block, generator) {

  const x = generator.valueToCode(block, 'COORDINATE_X', Order.NONE) || "''";
  const y = generator.valueToCode(block, 'COORDINATE_Y', Order.NONE) || "''";

  return generateCommand(block, true, 'string', 'move_to', x, y);
  
}

forBlock['get_obstacle'] = function (block, generator) {

  return [generateCommand(block, false, 'float', 'get_obstacle'), Order.ATOMIC];

  
}
