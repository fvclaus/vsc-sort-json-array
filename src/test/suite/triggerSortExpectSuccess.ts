import * as vscode from 'vscode';
import chai = require('chai');
export const expect = chai.expect;
import {openNewDocument, openNewJsonDocument} from './textEditorUtils';
import nextTick from './nextTick';
import { sleep } from './sleep';

export async function triggerSortJsExpectSuccess(
  command: 'extension.sortJsonArrayAscending' | 'extension.sortJsonArrayDescending' | 'extension.sortJsonArrayCustom',
  code: string,
  position: vscode.Position,
  expectedCode: string,
): Promise<void> {
  const {
      editor,
    } = await openNewDocument(code, '.js');
    
    editor.selection = new vscode.Selection(position, position);
    
    await vscode.commands.executeCommand(command);
    // Wait here is required to update the editor?
    await nextTick();
    const editorText = editor.document.getText();
    expect(editorText).to.be.equal(expectedCode);
}

export async function triggerSortJsonExpectSuccess(
    command: 'extension.sortJsonArrayAscending' | 'extension.sortJsonArrayDescending' | 'extension.sortJsonArrayCustom',
    array: unknown[],
    expectedArray: unknown[],
    userInputs?: () => Promise<unknown> | undefined): Promise<void> {
  const {
    editor,
  } = await openNewJsonDocument(JSON.stringify(array, null, 2));
  await vscode.commands.executeCommand('editor.action.selectAll');
  // The sort command may require input from the user. We cannot 'await' it, because it will hang indefinitely.
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
  await sleep(2000);
  const actualArray = JSON.parse(editor.document.getText());
  expect(actualArray).to.deep.equal(expectedArray);
  expect(actualArray).to.deep.equal(result);
}
