import * as Blockly from 'blockly/core';


const blocks = [];

// Note: All distances are in meters


// Stance blocks

blocks.push({
  type: 'sit',
  message0: 'Sedni',
  previousStatement: null,
  nextStatement: null,
  style: 'stance_blocks',
  tooltip: '',
  helpUrl: '',
});


blocks.push({
  type: 'stand',
  message0: 'Stůj',
  previousStatement: null,
  nextStatement: null,
  style: 'stance_blocks',
  tooltip: '',
  helpUrl: '',
});


blocks.push({
  type: 'stand_height',
  message0: 'Stůj ve výšce %1 m',
  args0: [
    {
      type: 'input_value',
      name: 'HEIGHT',
      check: 'Number'
    }
  ],
  previousStatement: null,
  nextStatement: null,
  style: 'stance_blocks',
  tooltip: '',
  helpUrl: '',
  inputsInline: true
});

blocks.push({
  type: 'stand_twisted',
  message0: '',
  message1: 'Nahni se %1 o %2',
  message2: 'Nahni se %1 o %2',
  message3: 'Natoč se %1 o %2',
  args0: [],
  args1: [
    {
    type: 'field_dropdown',
    name: 'PITCH_SELECT',
    options: [
      ['Dopředu', 'front'],
      ['Dozadu', 'back'],
    ],
    },
    {
      type: 'field_angle',
      name: 'PITCH',
      angle: '90',
    }
  ],
  args2: [
    {
      type: 'field_dropdown',
      name: 'ROLL_SELECT',
      options: [
        ['Doleva', 'left'],
        ['Doprava', 'right'],
      ],
    },
    {
      type: 'field_angle',
      name: 'ROLL',
      angle: '90'
    }
  ],
  args3: [
    {
      type: 'field_dropdown',
      name: 'YAW_SELECT',
      options: [
        ['Doleva', 'left'],
        ['Doprava', 'right'],
      ],
    },
    {
      type: 'field_angle',
      name: 'YAW',
      angle: '90'
    }
  ],
  previousStatement: null,
  nextStatement: null,
  style: 'stance_blocks',
  tooltip: '',
  helpUrl: '',
  inputsInline: false
});


// Motion blocks


blocks.push({
  type: 'move_to_absolute',
  message0: 'Jdi na X:%1 m  Y:%2 m',
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
});


blocks.push({
  type: 'move_to_relative',
  message0: 'Jdi %1 o %2 m  a   %3 o %4 m',
  args0: [
    {
      type: 'field_dropdown',
      name: 'X_SELECT',
      options: [
        ['dopředu', 'front'],
        ['dozadu', 'back'],
      ],
    },
    {
      type: 'input_value',
      name: 'COORDINATE_X',
      check: 'Number'
    },
    {
      type: 'field_dropdown',
      name: 'Y_SELECT',
      options: [
        ['doleva', 'left'],
        ['doprava', 'right'],
      ],
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
});


blocks.push({
  type: 'rotate_to_absolute',
  message0: 'Otoč se na %1',
  args0: [
    {
      type: 'input_value',
      name: 'ANGLE',
      check: 'Number'
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: 'motion_blocks',
  tooltip: '',
  helpUrl: '',
  inputsInline: true
});


blocks.push({
  type: 'rotate_to_relative',
  message0: 'Otoč se %1 o %2',
  args0: [
    {
      type: 'field_dropdown',
      name: 'ANGLE_SELECT',
      options: [
        ['doleva', 'left'],
        ['doprava', 'right'],
      ],
    },
    {
      type: 'input_value',
      name: 'ANGLE',
      check: 'Number'
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: 'motion_blocks',
  tooltip: '',
  helpUrl: '',
  inputsInline: true
});


blocks.push({
  type: 'get_current_position_x',
  message0: 'X souřadnice Spota ',
  output: 'Number',
  style: 'motion_blocks',
  tooltip: '',
  helpUrl: '',
});

blocks.push({
  type: 'get_current_position_y',
  message0: 'Y souřadnice Spota ',
  output: 'Number',
  style: 'motion_blocks',
  tooltip: '',
  helpUrl: '',
});

blocks.push({
  type: 'move',
  message0: 'Udělej krok %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'DIRECTION_SELECT',
      options: [
        ['dopředu', 'forward'],
        ['dozadu', 'backward'],
        ['doleva', 'left'],
        ['doprava', 'right'],
        ['natočení doleva', 'turn_left'],
        ['natočení doprava', 'turn_right'],
      ],
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: 'motion_blocks',
  tooltip: '',
  helpUrl: '',
  inputsInline: true
});

blocks.push({
  type: 'move_direction',
  message0: 'Udělej krok směrem %1',
  args0: [
    {
      type: 'input_value',
      name: 'ANGLE',
      check: 'Number'
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: 'motion_blocks',
  tooltip: '',
  helpUrl: '',
  inputsInline: true
});


// Sensor blocks

blocks.push({
  type: 'get_closest_fiducial_X',
  message0: 'X souřadnice nejbližšího AprilTagu',
  output: 'Number',
  style: 'sensor_blocks',
  tooltip: '',
  helpUrl: '',
});

blocks.push({
  type: 'get_closest_fiducial_Y',
  message0: 'Y souřadnice nejbližšího AprilTagu',
  output: 'Number',
  style: 'sensor_blocks',
  tooltip: '',
  helpUrl: '',
});


blocks.push({
  type: 'get_fiducial_with_id_X',
  message0: 'X souřadnice AprilTagu s ID %1',
  args0: [
  {
    type: 'input_value',
    name: 'ID',
    check: 'Number'
  }
  ],
  output: 'Number',
  style: 'sensor_blocks',
  tooltip: '',
  helpUrl: '',
});

blocks.push({
  type: 'get_fiducial_with_id_Y',
  message0: 'Y souřadnice AprilTagu s ID %1',
  args0: [
  {
    type: 'input_value',
    name: 'ID',
    check: 'Number'
  }
  ],
  output: 'Number',
  style: 'sensor_blocks',
  tooltip: '',
  helpUrl: '',
});

blocks.push({
  type: 'get_obstacle_distance',
  message0: 'Vzdálenost od překážky %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'SIDE_SELECT',
      options: [
        ['vpředu', 'front'],
        ['vzadu', 'back'],
        ['vlevo', 'left'],
        ['vpravo', 'right'],
      ],
    },
  ],
  output: 'Number',
  style: 'sensor_blocks',
  tooltip: '',
  helpUrl: '',
});





export const blocksSpot = Blockly.common.createBlockDefinitionsFromJsonArray(blocks);
