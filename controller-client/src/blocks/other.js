/**
 * Block definitions for supportive blocks
 */

import * as Blockly from 'blockly/core';


const blocks = [];

blocks.push({
  type: 'starter_block',
  message0: 'Start',
  nextStatement: null,
  hat: 'cap',
  colour: '#0FBD8C',
  tooltip: '',
  helpUrl: '',
});


blocks.push({
  type: 'display_value',
  message0: 'Ukaž hodnotu %1 :  %2',
  args0: [
    {
      type: 'input_value',
      name: 'VALUE',
      check: 'Number',
    },
    {
      type: 'field_label_serializable',
      name: 'DISPLAY',
      text: '0',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: '#0FBD8C',
  tooltip: '',
  helpUrl: '',
  inputsInline: true
});


blocks.push({
  type: 'wait',
  message0: 'Čekej %1 sekund',
  args0: [
    {
      type: 'input_value',
      name: 'TIME',
      check: 'Number'
    }
  ],
  previousStatement: null,
  nextStatement: null,
  style: 'loop_blocks',
  tooltip: '',
  helpUrl: '',
  inputsInline: true
});


blocks.push({
  type: 'key_press',
  message0: 'klávesa %1 je zmáčknuta',
  args0: [
    {
      type: 'field_dropdown',
      name: 'KEY',
      options: [
        ['Šipka vlevo', 'ArrowLeft'],
        ['Šipka vpravo', 'ArrowRight'],
        ['Šipka nahoru', 'ArrowUp'],
        ['Šipka dolů', 'ArrowDown'],
        ['A', 'A'],
        ['B', 'B'],
        ['C', 'C'],
        ['D', 'D'],
        ['E', 'E'],
        ['F', 'F'],
        ['G', 'G'],
        ['H', 'H'],
        ['I', 'I'],
        ['J', 'J'],
        ['K', 'K'],
        ['L', 'L'],
        ['M', 'M'],
        ['N', 'N'],
        ['O', 'O'],
        ['P', 'P'],
        ['Q', 'Q'],
        ['R', 'R'],
        ['S', 'S'],
        ['T', 'T'],
        ['U', 'U'],
        ['V', 'V'],
        ['W', 'W'],
        ['X', 'X'],
        ['Y', 'Y'],
        ['Z', 'Z'],
        ['0', '0'],
        ['1', '1'],
        ['2', '2'],
        ['3', '3'],
        ['4', '4'],
        ['5', '5'],
        ['6', '6'],
        ['7', '7'],
        ['8', '8'],
        ['9', '9'],
        ['Mezerník', ' '],
        ['Tab', 'Tab'],
        ['Shift', 'Shift'],
        ['CapsLock', 'CapsLock'],
        ['Control', 'Control'],
        ['Alt', 'Alt'],
        ['Enter', 'Enter'],
        ['Backspace', 'Backspace'],
        ['Delete', 'Delete'],
      ]
    }
  ],
  output: 'Boolean',
  colour: 'rgb(204, 51, 64)',
  tooltip: '',
  helpUrl: ''
});


Blockly.FieldAngle.WRAP = 180;
//Blockly.FieldAngle.CLOCKWISE = true;
Blockly.FieldAngle.OFFSET = 90;

blocks.push({
  type: 'angle',
  message0: '%1',
  args0: [
    {
      type: 'field_angle',
      name: 'ANGLE',
      angle: '90'
    },

  ],
  output: 'Number',
  style: 'position_blocks',
  tooltip: '',
  helpUrl: '',
});


blocks.push({
  type: 'xy_to_angle',
  message0: 'Směr z X:%1 Y:%2 ',
  message1: 'do X:%1 Y:%2',
  args0: [
    {
      type: 'input_value',
      name: 'X1',
      check: 'Number'
    },
    {
      type: 'input_value',
      name: 'Y1',
      check: 'Number'
    },
  ],
  args1: [
    {
      type: 'input_value',
      name: 'X2',
      check: 'Number'
    },
    {
      type: 'input_value',
      name: 'Y2',
      check: 'Number'
    },
  ],
  output: 'Number',
  style: 'position_blocks',
  tooltip: '',
  helpUrl: '',
  inputsInline: true,
});


blocks.push({
  type: 'xy_distance',
  message0: 'Vzdálenost z X:%1 Y:%2 ',
  message1: 'do X:%1 Y:%2',
  args0: [
    {
      type: 'input_value',
      name: 'X1',
      check: 'Number'
    },
    {
      type: 'input_value',
      name: 'Y1',
      check: 'Number'
    },
  ],
  args1: [
    {
      type: 'input_value',
      name: 'X2',
      check: 'Number'
    },
    {
      type: 'input_value',
      name: 'Y2',
      check: 'Number'
    },
  ],
  output: 'Number',
  style: 'position_blocks',
  tooltip: '',
  helpUrl: '',
  inputsInline: true,
});


export const blocksOther = Blockly.common.createBlockDefinitionsFromJsonArray(blocks);