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
  style: 'motion_blocks',
  tooltip: '',
  helpUrl: '',
  inputsInline: true
};


const get_obstacle = {
  type: 'get_obstacle',
  message0: 'Vzdálenost od překážky vpředu',
  output: 'Number',
  style: 'sensor_blocks',
  tooltip: '',
  helpUrl: '',
};

const starter_block = {
  type: 'starter_block',
  message0: 'Start',
  nextStatement: null,
  style: 'start_blocks',
  tooltip: '',
  helpUrl: '',
};

export const blocks2 = Blockly.common.createBlockDefinitionsFromJsonArray([
  starter_block, move_to, get_obstacle,
]);