/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { blocks2 } from './blocks/test';

import { blocks } from './blocks/text';
import { forBlock } from './generators/javascript';
import './index.css';
import { save } from './serialization';
import { toolbox } from './toolbox';
import './websocket.js';

// Register the blocks and generator with Blockly

Blockly.common.defineBlocks(blocks);

Blockly.common.defineBlocks(blocks2);
Object.assign(javascriptGenerator.forBlock, forBlock);



// Set up UI elements and inject Blockly
//const codeDiv = document.getElementById('generatedCode').firstChild;
//const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {toolbox});

// Positioning of the run button
document.querySelector('.blocklyToolboxContents').appendChild(document.querySelector('#buttonContainer'));
document.querySelector('#buttonContainer').style.display = 'flex';
var button = document.querySelector('#runButton');

//ws.zoomToFit();
//ws.zoomCenter(-0.5);

// TODO: comment
// Async funtion so that we can use eval
const runCode = () => {
  const code = javascriptGenerator.workspaceToCode(ws);
  console.log(code);

  //Catch any errors that can occur during execution
  try {
    // Wrap the code in an async function before executing it so that we can use await
    eval(`(async () => { ${code} })();`);

  } catch (error) {
    console.error('Execution error:', error); //TODO display error
  }
  

  /* // Get all top blocks (blocks that have no parent)
  const topBlocks = ws.getTopBlocks();

  // Find the starter block among the top blocks
  const starterBlock = topBlocks.find(block => block.type === 'starter_block');

  // If there's no starter block, don't execute any code
  if (!starterBlock) {
    console.log('No starter block found');
    return;
  }

  // Generate and execute the code starting from the starter block
  const code = javascriptGenerator.blockToCode(starterBlock);
  console.log(code);
  eval(code);*/
};


// Load the initial state from storage and run the code.
//load(ws);
//runCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});


button.addEventListener("click", (e) => {

  runCode();
});

/*// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (
    e.isUiEvent ||
    e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()
  ) {
    return;
  }
  runCode();
});*/
