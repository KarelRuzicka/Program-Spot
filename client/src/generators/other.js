/**
 * Code definitions for supportive blocks
 */

import { Order } from 'blockly/javascript';


export const forBlockOther = Object.create(null);


forBlockOther['starter_block'] = function (block, generator) {
  return "";
};


forBlockOther['display_value'] = function (block, generator) {
  let value = generator.valueToCode(block, 'VALUE', Order.ATOMIC) || "''";

  let code = `
    (function(value) {
      if (!isNaN(value)) {
        return Number(Number(value).toFixed(3));
      }
      return value;
    })(${value})
  `;

  return `window.blocklyWs.getBlockById('${block.id}').setFieldValue(${code}, 'DISPLAY');\n`;

};


forBlockOther['wait'] = function(block, generator) {
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

  forBlockOther['key_press'] = function(block, generator) {
  let key = block.getFieldValue('KEY');

  let code = ``;
  code += `(function() {`;
  code += `return window.pressedKeys['${key}'] || window.pressedKeys['${key}'.toLowerCase()];`;
  code += `})()`;


  return [code, Order.ATOMIC];
};


/**
 * Custom while loop that prevents infinite loops and allows for interruption 
 */
forBlockOther['controls_whileUntil'] = function(block, generator) {
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
  return 'while (' + argument0 + ') {\n' + branch + '; if(window.interruption == true){throw new Error("Loop interrupted"); }; await new Promise(resolve => setTimeout(resolve,  10));}\n';
};


forBlockOther['angle'] = function(block, generator) {

  let angle = block.getFieldValue('ANGLE');

  return [angle, Order.ATOMIC];

};

forBlockOther['xy_to_angle'] = function(block, generator) {
  let x1 = generator.valueToCode(block, 'X1', Order.NONE) || "''";
  let y1 = generator.valueToCode(block, 'Y1', Order.NONE) || "''";

  let x2 = generator.valueToCode(block, 'X2', Order.NONE) || "''";
  let y2 = generator.valueToCode(block, 'Y2', Order.NONE) || "''";

  let code = ``;
  code += `await (async function() {`;
  code += `var dx = Number(${x2}) - Number(${x1});`;
  code += `var dy = Number(${y2}) - Number(${y1});`;
  code += `var rad = Math.atan2(dy, dx);`;
  code += `var deg = rad * (180 / Math.PI);`;
  code += `return deg;`;
  code += `})()`;
  
  return [code, Order.ATOMIC];
};

forBlockOther['xy_distance'] = function(block, generator) {
  let x1 = generator.valueToCode(block, 'X1', Order.NONE) || "''";
  let y1 = generator.valueToCode(block, 'Y1', Order.NONE) || "''";

  let x2 = generator.valueToCode(block, 'X2', Order.NONE) || "''";
  let y2 = generator.valueToCode(block, 'Y2', Order.NONE) || "''";


  let code = ``;
  code += `await (async function() {`;
  code += `var dx = Number(${x2}) - Number(${x1});`;
  code += `var dy = Number(${y2}) - Number(${y1});`;
  code += `var distance = Math.sqrt(dx * dx + dy * dy);`;
  code += `return distance;`;
  code += `})()`;
  
  return [code, Order.ATOMIC];
};