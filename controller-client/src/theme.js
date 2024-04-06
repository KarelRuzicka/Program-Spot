/**
 * Theme definitions for the Blockly workspace.
 */

import * as Blockly from 'blockly/core';


export const theme = Blockly.Theme.defineTheme('vivid', {
    'base': Blockly.Themes.Classic,
    'blockStyles': {
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
        'position_blocks': {
            'colourPrimary': 160,
            'colourSecondary':'rgb(211,211,211)',
        },
        'stance_blocks': {
            'colourPrimary': 'rgb(92, 177, 214)'
        },
        'motion_blocks': {
            'colourPrimary': 'rgb(76, 151, 255)'
        },
        'sensor_blocks': {
            'colourPrimary': 'rgb(153, 102, 255)'
        },
        'sound_blocks': {
            'colourPrimary': 'rgb(207, 99, 207)'
        },
        'variable_blocks': {
            'colourPrimary': 'rgb(255, 140, 26)'  
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
        'stance_category': {
            'colour': 'rgb(92, 177, 214)'
        },
        'motion_category': {
            'colour': 'rgb(76, 151, 255)'
        },
        'sensor_category': {
            'colour': 'rgb(153, 102, 255)'
        },
        'sound_category': {
            'colour': 'rgb(207, 99, 207)'
        },
        'variable_category': {
            'colour': 'rgb(255, 140, 26)'  
        },
    },
    });
