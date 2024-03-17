/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order } from 'blockly/javascript';

// Export all the code generators for our custom blocks,
// but don't register them with Blockly yet.
// This file has no side effects!
export const forBlock = Object.create(null);

forBlock['add_text'] = function (block, generator) {
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  const color =
    generator.valueToCode(block, 'COLOR', Order.ATOMIC) || "'#ffffff'";



  const addText = generator.provideFunction_(
    'addText',
    `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(text, color) {

  // Add text to the output area.
  const outputDiv = document.getElementById('output');
  const textEl = document.createElement('p');
  textEl.innerText = text;
  textEl.style.color = color;
  outputDiv.appendChild(textEl);
}`,
  );
  // Generate the function call for this block.
  const code = `${addText}(${text}, ${color});\n`;
  return code;
};


forBlock['add_text2'] = function (block, generator) {
  const text = generator.valueToCode(block, 'ABC', Order.NONE) || "''";


  // Generate the function call for this block.
  let code = `console.log(${text});\n`;
  return code;
};

forBlock['display_value'] = function (block, generator) {

  let value = generator.valueToCode(block, 'VALUE', Order.ATOMIC) || "''";
  if (!isNaN(eval(value))) {
    value = eval(value);
  }
  block.setFieldValue(value, 'DISPLAY');

  return `//Display\n`;

};


function generateCommand(block, inline=false, command, ...args) {

  let code = ``;
  code += `await (async function() {`;

  code += `window.blocklyWs.highlightBlock('${block.id}');`;
  code += `let previouslyHighlighted = window.blocklyHighighted;`;
  code += `window.blocklyHighighted = '${block.id}';`;

  code += `let response = await window.sendCommand('${command}', ${args.join(', ')});`;
  
  code += `window.blocklyWs.highlightBlock(previouslyHighlighted);`;
  code += `window.blocklyHighighted = previouslyHighlighted;`;

  code += `if (response == 'False') { throw new Error('Command failed');}\n`;

  code+= `return response;`;
  code += `})()`;

  if (inline) {
    code += `;\n`;
  }

  return code;
}

forBlock['starter_block'] = function (block, generator) {
  return "";
}


forBlock['move_to'] = function (block, generator) {

  const x = generator.valueToCode(block, 'COORDINATE_X', Order.NONE) || "''";
  const y = generator.valueToCode(block, 'COORDINATE_Y', Order.NONE) || "''";

  return generateCommand(block, true, 'move_to', x, y);
  
}

forBlock['get_obstacle'] = function (block, generator) {

  return [generateCommand(block, false, 'get_obstacle'), Order.ATOMIC];

  
}
