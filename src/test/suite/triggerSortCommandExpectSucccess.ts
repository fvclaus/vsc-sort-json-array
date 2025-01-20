import * as vscode from 'vscode';
import chai = require('chai');
const expect = chai.expect;
import {openNewJsonDocument} from './textEditorUtils';
import nextTick from './nextTick';

export async function triggerSortCommandExpectSuccess(
    // TODO type string
    command: string,
    array: unknown[] | string,
    expectedArray: unknown[] | string,
    userInputs?: () => Promise<unknown> | undefined): Promise<void> {
  const {
    editor,
  } = await openNewJsonDocument(typeof array === 'string'?  array : JSON.stringify(array, null, 2));
  await vscode.commands.executeCommand('editor.action.selectAll');
  // The sort command may require input from the user. We cannot 'await' it, because it will hang indefinetely.
  let result;
  if (userInputs != null) {
    const resultPromise = vscode.commands.executeCommand(command);
    // Wait for quick open
    await nextTick();
    await userInputs();
    result = await resultPromise;
  } else {
    result = await vscode.commands.executeCommand(command);
  }
  // Wait here is required to update the editor?
  await nextTick();
  if (typeof expectedArray == 'string')  {
    expect(editor.document.getText()).to.deep.equal(expectedArray);
    // TODO What about result comparison?
  } else {
    const actualArray = JSON.parse(editor.document.getText());
    expect(actualArray).to.deep.equal(expectedArray);
    expect(actualArray).to.deep.equal(result);
  }
}
