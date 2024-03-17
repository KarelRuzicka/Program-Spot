
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { blocks2 } from './blocks/spot';
import { blocks } from './blocks/text';
import './fullscreen';
import { forBlock } from './generators/javascript';
import './index.css';
import { load, save } from './serialization';
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

//Positioning of the run button
//document.querySelector('.blocklyToolboxContents').appendChild(document.querySelector('#buttonContainer'));
//document.querySelector('#buttonContainer').removeAttribute('style');
ws.resize();


//ws.zoomToFit();
//ws.zoomCenter(-0.5);

window.blocklyWs = ws;
window.blocklyHighighted = null;

// TODO: comment
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
  // Generate and execute the code starting from the starter block
  const code = javascriptGenerator.blockToCode(starterBlock);
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

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});

document.querySelector('#resetButton').addEventListener("click", (e) => {
  if (confirm("Opravdu chcete vymazat projekt?")) {
    ws.clear();
    initWs(ws);
    ws.scroll(0, 0);
  }
  
});



/*document.querySelector('.blocklyZoom:nth-of-type(3) image').addEventListener("mousedown", (e) => {

  // The zoom reset DOM has this structure:
  //   svg
  //     clipPath id=blocklyZoomresetClipPath...
  //       rect
  //     image
  // The image has the mousedown event.

  e.preventDefault();
  console.log('click')
  setTimeout(function() {
    ws.scroll(0, 0);
  }, 100);

  // Blockly.bindEventWithChecks_(this, 'mousedown', null, function(e) {
  //   console.log('click')
  //   workspace.markFocused();
  //   workspace.beginCanvasTransition();
  //   workspace.zoomToFit();
  //   setTimeout(function() {
  //     workspace.endCanvasTransition();
  //   }, 500);
  //   Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
  //   e.stopPropagation();  // Don't start a workspace scroll.
  //     // Stop double-clicking from selecting text.
  // });
});*/



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



