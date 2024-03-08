import * as Blockly from 'blockly/core';


const move_to = {
  type: 'move_to',
  message0: 'Jdi na X:%1 Y:%2',
  args0: [
    {
      type: 'input_value',
      name: 'COORDINATE_X',
      check: 'Number'
    },
    {
      type: 'input_value',
      name: 'COORDINATE_Y',
      check: 'Number'
    }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 160,
  tooltip: '',
  helpUrl: '',
  inputsInline: true,
};


const get_obstacle = {
  type: 'get_obstacle',
  message0: 'Obstacle in front of Spot',
  output: 'Number',
  colour: '#8B0000',
  tooltip: '',
  helpUrl: '',
};

export const blocks2 = Blockly.common.createBlockDefinitionsFromJsonArray([
  move_to, get_obstacle,
]);