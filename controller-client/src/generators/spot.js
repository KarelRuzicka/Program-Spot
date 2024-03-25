
import { Order } from 'blockly/javascript';


export const forBlockSpot = Object.create(null);


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

// Stance

forBlockSpot['sit'] = function (block, generator) {

  return generateCommand(block, true, 'string', 'sit');
}


forBlockSpot['stand'] = function (block, generator) {

  return generateCommand(block, true, 'string', 'stand');
  
}


forBlockSpot['stand_height'] = function (block, generator) {

  const x = generator.valueToCode(block, 'HEIGHT', Order.NONE) || "''";

  return generateCommand(block, true, 'string', 'stand_height', x);
  
}


forBlockSpot['stand_twisted'] = function (block, generator) {

  let pitch = block.getFieldValue('PITCH');
  if (block.getFieldValue('PITCH_SELECT') === 'back') {
    pitch *= -1;
  }

  let roll = block.getFieldValue('ROLL');
  if (block.getFieldValue('ROLL_SELECT') === 'right') {
    roll *= -1;
  }

  let yaw = block.getFieldValue('YAW');
  if (block.getFieldValue('YAW_SELECT') === 'right') {
    yaw *= -1;
  }

  return generateCommand(block, true, 'string', 'stand_twisted', yaw, roll, pitch);
}

// Motion

forBlockSpot['move_to_absolute'] = function (block, generator) {
  
  const x = generator.valueToCode(block, 'COORDINATE_X', Order.NONE) || "''";
  const y = generator.valueToCode(block, 'COORDINATE_Y', Order.NONE) || "''";

  return generateCommand(block, true, 'string', 'move_to_absolute', x, y);
    
}

forBlockSpot['move_to_relative'] = function (block, generator) {

  let x = generator.valueToCode(block, 'COORDINATE_X', Order.NONE) || "''";
  if (block.getFieldValue('X_SELECT') === 'back') {
    x *= -1;
  }

  let y = generator.valueToCode(block, 'COORDINATE_Y', Order.NONE) || "''";
  if (block.getFieldValue('Y_SELECT') === 'right') {
    y *= -1;
  }

  return generateCommand(block, true, 'string', 'move_to_relative', x, y);
}

forBlockSpot['rotate_to_absolute'] = function (block, generator) {

  const angle = generator.valueToCode(block, 'ANGLE', Order.NONE) || "''";

  return generateCommand(block, true, 'string', 'rotate_to_absolute', angle);
}

forBlockSpot['rotate_to_relative'] = function (block, generator) {

  let angle = generator.valueToCode(block, 'ANGLE', Order.NONE) || "''";
  if (block.getFieldValue('ANGLE_SELECT') === 'right') {
    angle *= -1;
  }

  return generateCommand(block, true, 'string', 'rotate_to_relative', angle);
}

forBlockSpot['get_current_position_x'] = function (block, generator) {

  return [generateCommand(block, false, 'float', 'get_current_position_x'), Order.ATOMIC];
}

forBlockSpot['get_current_position_y'] = function (block, generator) {

  return [generateCommand(block, false, 'float', 'get_current_position_y'), Order.ATOMIC];
}


forBlockSpot['move'] = function (block, generator) {

  switch (block.getFieldValue('DIRECTION_SELECT')) {
    case 'forward':
      return generateCommand(block, true, 'string', 'move_forward');
    case 'backward':
      return generateCommand(block, true, 'string', 'move_backward');
    case 'left':
      return generateCommand(block, true, 'string', 'move_left');
    case 'right':
      return generateCommand(block, true, 'string', 'move_right');
    case 'turn_left':
      return generateCommand(block, true, 'string', 'rotate_left');
    case 'turn_right':
      return generateCommand(block, true, 'string', 'rotate_right');
  }

  return '';
}

forBlockSpot['move_direction'] = function (block, generator) {

  let angle = generator.valueToCode(block, 'ANGLE', Order.NONE) || "''";

  return generateCommand(block, true, 'string', 'move_direction', angle);
}

// Sensors

forBlockSpot['get_closest_fiducial_X'] = function (block, generator) {

  return [generateCommand(block, false, 'float', 'get_closest_fiducial_X'), Order.ATOMIC];
}

forBlockSpot['get_closest_fiducial_Y'] = function (block, generator) {

  return [generateCommand(block, false, 'float', 'get_closest_fiducial_X'), Order.ATOMIC];
}

forBlockSpot['get_fiducial_with_id_X'] = function (block, generator) {

  let id = generator.valueToCode(block, 'ID', Order.NONE) || "''";

  return [generateCommand(block, false, 'float', 'get_fiducial_with_id_X',id), Order.ATOMIC];
}

forBlockSpot['get_fiducial_with_id_Y'] = function (block, generator) {

  let id = generator.valueToCode(block, 'ID', Order.NONE) || "''";

  return [generateCommand(block, false, 'float', 'get_fiducial_with_id_Y',id), Order.ATOMIC];
}

forBlockSpot['get_obstacle_distance'] = function (block, generator) {

  let side = block.getFieldValue('SIDE_SELECT');

  return [generateCommand(block, false, 'float', 'get_obstacle_distance','"'+side+'"'), Order.ATOMIC];
}


