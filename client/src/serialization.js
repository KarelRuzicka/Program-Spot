/**
 * Functions for saving and loading workspace state either to local storage or to a file.
 */

import * as Blockly from 'blockly/core';

const storageKey = 'mainWorkspace';

/**
 * Saves the state of the workspace to browser's local storage.
 * @param {Blockly.Workspace} workspace Blockly workspace to save.
 */
export const save = function (workspace) {
  const data = Blockly.serialization.workspaces.save(workspace);
  window.localStorage?.setItem(storageKey, JSON.stringify(data));
};

/**
 * Loads saved state from local storage into the given workspace.
 * @param {Blockly.Workspace} workspace Blockly workspace to load into.
 */
export const load = function (workspace) {
  const data = window.localStorage?.getItem(storageKey);
  if (!data) return;

  // Don't emit events during loading.
  Blockly.Events.disable();
  Blockly.serialization.workspaces.load(JSON.parse(data), workspace, false);
  Blockly.Events.enable();
};



/**
 * Download the workspace state as a file.
 * @param {*} workspace 
 * @param {*} filename 
 */
export function download(workspace, filename = 'file.txt') {
  const data = Blockly.serialization.workspaces.save(workspace);

  const blob = new Blob([JSON.stringify(data)], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


/**
 * Upload a workspace state from a file.
 * @param {*} workspace 
 * @param {*} callback after the upload is done
 * @param {*} extension 
 */
export function upload(workspace, callback, extension = '.txt') {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = extension;
  input.onchange = function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        JSON.parse(event.target.result);
      } catch (e) {
        alert('Neplatný soubor');
        return;
      }
      Blockly.Events.disable();
      Blockly.serialization.workspaces.load(JSON.parse(event.target.result), workspace, false);
      Blockly.Events.enable();
      callback();
    };
    reader.readAsText(file);
  };
  input.click();
}
