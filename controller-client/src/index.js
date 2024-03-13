/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { blocks2 } from './blocks/spot';
import { blocks } from './blocks/text';
import './fullscreen';
import { forBlock } from './generators/javascript';
import './index.css';
import { save } from './serialization';
import { theme } from './theme';
import { toolbox } from './toolbox';
import './websocket';

// Register the blocks and generator with Blockly

Blockly.common.defineBlocks(blocks);

Blockly.common.defineBlocks(blocks2);
Object.assign(javascriptGenerator.forBlock, forBlock);



// Set up UI elements and inject Blockly
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {
  toolbox: toolbox,
  theme: theme,
  renderer: 'geras',
});


// Positioning of the run button
document.querySelector('.blocklyToolboxContents').appendChild(document.querySelector('#buttonContainer'));
document.querySelector('#buttonContainer').style.display = 'block';
var button = document.querySelector('#runButton');
ws.resize();

//ws.zoomToFit();
//ws.zoomCenter(-0.5);

window.blocklyWs = ws;
window.blocklyHighighted = null;

// TODO: comment
const runCode = () => {
  //let code = javascriptGenerator.workspaceToCode(ws);
  window.blocklyHighighted = null;

  //console.log(code);

  // Get all top blocks (blocks that have no parent)
  const topBlocks = ws.getTopBlocks();

  // Find the starter block among the top blocks
  const starterBlock = topBlocks.find(block => block.type === 'starter_block');

  // If there's no starter block, don't execute any code
  if (!starterBlock) {
    console.log('No starter block found');
    return;
  }

  javascriptGenerator.init(ws);
  // Generate and execute the code starting from the starter block
  const code = javascriptGenerator.blockToCode(starterBlock);
  console.log(code);

  //Catch any errors that can occur during execution
  try {
    // Wrap the code in an async function before executing it so that we can use await
    eval(`(async () => { ${code} })();`);

  } catch (error) {
    console.error('Execution error:', error); //TODO display error
  }

  console.log('Code executed');
};


var starter_block = ws.newBlock('starter_block');
starter_block.initSvg();
starter_block.render();
starter_block.moveTo({ x: 100, y: 100 });
starter_block.setDeletable(false);


// Load the initial state from storage and run the code.
//load(ws);

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
