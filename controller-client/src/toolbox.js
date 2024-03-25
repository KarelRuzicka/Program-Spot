/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/*
This toolbox contains nearly every single built-in block that Blockly offers,
in addition to the custom block 'add_text' this sample app adds.
You probably don't need every single block, and should consider either rewriting
your toolbox from scratch, or carefully choosing whether you need each block
listed here.
*/

export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Postoj',
      categorystyle: 'stance_category',
      contents: [
        {
          kind: 'block',
          type: 'sit',
        },
        {
          kind: 'block',
          type: 'stand',
        },
        {
          kind: 'block',
          type: 'stand_height',
          inputs: {
            HEIGHT: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 0.5,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'stand_twisted',
        },      
      ],
    },
    {
      kind: 'category',
      name: 'Pohyb',
      categorystyle: 'motion_category',
      contents: [  
        {
          kind: 'block',
          type: 'move_to_absolute',
          inputs: {
            COORDINATE_X: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 0.5,
                },
              },
            },
            COORDINATE_Y: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 0.5,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'rotate_to_absolute',
          inputs: {
            ANGLE: {
              shadow: {
                type: 'angle',
                
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'move_to_relative',
          inputs: {
            COORDINATE_X: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 0.5,
                },
              },
            },
            COORDINATE_Y: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 0.5,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'rotate_to_relative',
          inputs: {
            ANGLE: {
              shadow: {
                type: 'angle',
                
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'get_current_position_x',
        },
        {
          kind: 'block',
          type: 'get_current_position_y',
        },
        {
          kind: 'block',
          type: 'move',
        },
        {
          kind: 'block',
          type: 'move_direction',
          inputs: {
            ANGLE: {
              shadow: {
                type: 'angle',
                
              },
            },
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Senzory',
      categorystyle: 'sensor_category',
      contents: [
        {
          kind: 'block',
          type: 'get_closest_fiducial_X',
        },
        {
          kind: 'block',
          type: 'get_closest_fiducial_Y',
        },
        {
          kind: 'block',
          type: 'get_fiducial_with_id_X',
          inputs: {
            ID: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'get_fiducial_with_id_Y',
          inputs: {
            ID: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'get_obstacle_distance',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Zvuky',
      categorystyle: 'sound_category',
      contents: [

        
      ],
    },
    {
      kind: 'sep',
    },
    {
      kind: 'category',
      name: 'Logika',
      categorystyle: 'logic_category',
      contents: [
        {
          kind: 'block',
          type: 'controls_if',
        },
        {
          kind: 'block',
          type: 'logic_compare',
        },
        {
          kind: 'block',
          type: 'logic_operation',
        },
        {
          kind: 'block',
          type: 'logic_negate',
        },
        {
          kind: 'block',
          type: 'logic_boolean',
        },
        {
          kind: 'block',
          type: 'key_press',
          
        },
      ],
    },
    {
      kind: 'category',
      name: 'Průběh',
      categorystyle: 'loop_category',
      contents: [
        {
          kind: 'block',
          type: 'wait',
          inputs: {
            TIME: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 10,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_repeat_ext',
          inputs: {
            TIMES: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 10,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_whileUntil',
        },
        {
          kind: 'block',
          type: 'controls_for',
          inputs: {
            FROM: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
            TO: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 10,
                },
              },
            },
            BY: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_flow_statements',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Matematika',
      categorystyle: 'math_category',
      contents: [      
        {
          kind: 'block',
          type: 'math_number',
          fields: {
            NUM: 10,
          },
        },
        {
          kind: 'block',
          type: 'math_arithmetic',
          inputs: {
            A: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
            B: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'math_single',
          inputs: {
            NUM: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 9,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'math_round',
          fields: {
            OP: 'ROUND',
          },
          inputs: {
            NUM: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 3.1,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'angle',
        },
        {
          kind: 'block',
          type: 'xy_to_angle',
          inputs: {
            X1: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
            Y1: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },

            X2: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
            Y2: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'xy_distance',
          inputs: {
            X1: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
            Y1: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },

            X2: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
            Y2: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'display_value',
          inputs: {
            VALUE: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 0,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'math_number_property',
          inputs: {
            NUMBER_TO_CHECK: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 0,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'math_modulo',
          inputs: {
            DIVIDEND: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 64,
                },
              },
            },
            DIVISOR: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 10,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'math_random_int',
          inputs: {
            FROM: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
            TO: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 100,
                },
              },
            },
          },
        },
      ],
    },
    /*{
      kind: 'category',
      name: 'Color',
      categorystyle: 'colour_category',
      contents: [
        {
          kind: 'block',
          type: 'colour_picker',
        },
        {
          kind: 'block',
          type: 'colour_random',
        },
        {
          kind: 'block',
          type: 'colour_rgb',
          inputs: {
            RED: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 100,
                },
              },
            },
            GREEN: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 50,
                },
              },
            },
            BLUE: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 0,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'colour_blend',
          inputs: {
            COLOUR1: {
              shadow: {
                type: 'colour_picker',
                fields: {
                  COLOUR: '#ff0000',
                },
              },
            },
            COLOUR2: {
              shadow: {
                type: 'colour_picker',
                fields: {
                  COLOUR: '#3333ff',
                },
              },
            },
            RATIO: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 0.5,
                },
              },
            },
          },
        },
      ],
    },*/
    {
      kind: 'category',
      name: 'Proměnné',
      categorystyle: 'variable_category',
      custom: 'VARIABLE',
    },
    /*{
      kind: 'category',
      name: 'Functions',
      categorystyle: 'procedure_category',
      custom: 'PROCEDURE',
    },*/
    {
      kind: 'sep',
    },
  ],
};
