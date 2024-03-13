import * as Blockly from 'blockly/core';


export const theme = Blockly.Theme.defineTheme('vivid', {
    'base': Blockly.Themes.Classic,
    'blockStyles': {
        'start_blocks': {
            'colourPrimary': 'rgb(92, 177, 214)',
            'hat': 'cap',
        },
        'logic_blocks': {
          'colourPrimary': 'rgb(255, 102, 128)'
        },
        'loop_blocks': {
            'colourPrimary': 'rgb(255, 171, 25)'
        },
        'math_blocks': {
            'colourPrimary': 'rgb(89, 192, 89)',
            'colourSecondary':'rgb(211,211,211)',
        },
        'motion_blocks': {
            'colourPrimary': 'rgb(76, 151, 255)'
       },
       'sensor_blocks': {
            'colourPrimary': 'rgb(153, 102, 255)'
       },
    },  
    'categoryStyles': {
        'logic_category': {
            'colour': 'rgb(255, 102, 128)'
            
        },
        'loop_category': {
            'colour': 'rgb(255, 171, 25)'
        },
        'math_category': {
            'colour': 'rgb(89, 192, 89)'
            
        },
        'motion_category': {
            'colour': 'rgb(76, 151, 255)'
       },
       'sensor_category': {
            'colour': 'rgb(153, 102, 255)'
   },
    },
    });