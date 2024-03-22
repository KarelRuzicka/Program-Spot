import * as Blockly from 'blockly/core';


const blocks = [];

blocks.push({
  type: 'starter_block',
  message0: 'Start',
  nextStatement: null,
  style: 'start_blocks',
  tooltip: '',
  helpUrl: '',
});


blocks.push({
  type: 'display_value',
  message0: 'Vypiš hodnotu %1 :  %2',
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
  colour: 160,
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


blocks.push({
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
});


blocks.push({
  type: 'get_obstacle',
  message0: 'Vzdálenost od překážky vpředu',
  output: 'Number',
  style: 'sensor_blocks',
  tooltip: '',
  helpUrl: '',
});


export const blocksSpot = Blockly.common.createBlockDefinitionsFromJsonArray(blocks);
