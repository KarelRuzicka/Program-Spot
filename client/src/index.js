/**
 * Main module of the application. Handles the Blockly workspace and the UI.
 */

import '@fortawesome/fontawesome-free/css/all.min.css';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { blocksOther } from './blocks/other';
import { blocksSpot } from './blocks/spot';
import './fullscreen';
import { forBlockOther } from './generators/other';
import { forBlockSpot } from './generators/spot';
import './index.css';
import { download, load, save, upload } from './serialization';
import { theme } from './theme';
import { toolbox } from './toolbox';
import './websocket';

import * as cs from 'blockly/msg/cs';



Blockly.setLocale(cs);

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocksSpot);
Blockly.common.defineBlocks(blocksOther);
Object.assign(javascriptGenerator.forBlock, forBlockSpot);
Object.assign(javascriptGenerator.forBlock, forBlockOther);


// Inject Blockly
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {
  toolbox: toolbox,
  theme: theme,
  media: 'media/',
  renderer: 'geras',
  zoom:
  {
    controls: true,
    wheel: false,
    startScale: 1.0,
    maxScale: 2,
    minScale: 0.3,
    scaleSpeed: 1.2,
    pinch: true
  },
  trashcan: false,
});

// Show sidebar
document.querySelector('#buttonContainer').removeAttribute('style');

// Setup resetbutton
document.querySelector('#resetButton').addEventListener("click", (e) => {
  if (confirm("Opravdu chcete vymazat projekt?")) {
    ws.clear();
    initWs(ws);
    ws.scroll(0, 0);
    save(ws);
  }
  
});


window.blocklyWs = ws;
window.blocklyHighighted = null;


/**
 * Runs the code thats under a Start topblock. Also handles exceptions and freezes the blocks.
 */
window.runCode = () => {

  window.blocklyHighighted = null;

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

  // Generate the code starting from the starter block
  let code = javascriptGenerator.blockToCode(starterBlock);


  // Get all variables in the workspace
  let variables = Blockly.Variables.allUsedVarModels(ws);

  // Generate the variable declarations (they are not included in the topblocks code)
  let varDeclarations = '';
  for (let i = 0; i < variables.length; i++) {
    varDeclarations += 'var ' + variables[i].name + ';\n';
  }

  code = varDeclarations + code;

  console.log(code);

  // Get all blocks under the starter block, including the starter block itself
  const allBlocks = starterBlock.getDescendants();
  // Disable all blocks
  allBlocks.forEach(block => {
    block.setMovable(false); 
    block.setEditable(false);
  });


  // Wrap the code in an async function before executing it so that we can use await
  eval(`(async () => { ${code}; window.commandSuccess();})();`)
  .catch(error => { //Catch any errors that can occur during execution
    window.commandError();
    ws.highlightBlock(null);
    console.error(error);
  }).finally(() => {
    // Re-enable all blocks after execution
    allBlocks.forEach(block => {
      block.setMovable(true);
      block.setEditable(true);
    });
  });
  
};


function initWs(ws) {
  var starter_block = ws.newBlock('starter_block');
  starter_block.initSvg();
  starter_block.render();
  starter_block.moveTo({ x: 50, y: 50 });
  starter_block.setDeletable(false);
}

initWs(ws);

// Load the initial state from storage and run the code.
load(ws);

// Reset blocks
ws.getAllBlocks().forEach(block => {
  block.setMovable(true);
  block.setEditable(true);
});

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});



document.querySelector('#filesButton').addEventListener("click", (e) => {

  let saveButton = document.querySelector('#saveButton');
  let loadButton = document.querySelector('#loadButton');

  if (saveButton.style.display === "block") {
    saveButton.style.display = "none";
    loadButton.style.display = "none";
  } else{
    saveButton.style.display = "block";
    loadButton.style.display = "block";
  }
});

document.querySelector('#saveButton').addEventListener("click", (e) => {
  download(ws, 'projekt.spot');
});

document.querySelector('#loadButton').addEventListener("click", (e) => {

  let callback = function() {
    save(ws);
    ws.scroll(0, 0);
  }

  upload(ws, callback, ".spot",);
});




