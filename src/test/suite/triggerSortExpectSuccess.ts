import * as vscode from 'vscode';
import chai = require('chai');
export const expect = chai.expect;
import {openNewDocument, openNewJsonDocument} from './textEditorUtils';
import nextTick from './nextTick';
import { expectZeroInvocations, setupSpies } from './setupSpies';


type SortCommands = 'extension.sortJsonArrayAscending' | 'extension.sortJsonArrayDescending' | 'extension.sortJsonArrayCustom';


export type Config = {
  command: SortCommands,
  code: string,
  position: vscode.Position,
  expectedCode: string,
  fileExtension: string,
  userInputs?: () => Promise<unknown> | undefined,
}

export async function triggerSortExpectSuccess(
  config: Config
): Promise<void> {
  const {showErrorMessageSpy} = setupSpies();
  const {
      editor,
    } = await openNewDocument(config.code, config.fileExtension);

    editor.selection = new vscode.Selection(config.position, config.position);
    const resultPromise = vscode.commands.executeCommand(config.command);
    if (config.userInputs != null) {
      // Wait for quick open
      await nextTick();
      await config.userInputs();
    }
    await resultPromise;
    
    expectZeroInvocations(showErrorMessageSpy);
    // Wait here is required to update the editor?
    await nextTick();
    const editorText = editor.document.getText();
    expect(editorText).to.be.equal(config.expectedCode);
}


export async function triggerSortJsExpectSuccess(
  command: SortCommands,
  code: string,
  position: vscode.Position,
  expectedCode: string,
  userInputs?: () => Promise<unknown> | undefined
): Promise<void> {
  await triggerSortExpectSuccess({
    code,
    command,
    position,
    expectedCode,
    userInputs,
    fileExtension: '.js'
  })
}

export async function triggerSortJsonExpectSuccess(
    command: SortCommands,
    array: unknown[],
    expectedArray: unknown[],
    userInputs?: () => Promise<unknown> | undefined): Promise<void> {
  const {showErrorMessageSpy} = setupSpies();
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
  expectZeroInvocations(showErrorMessageSpy);
  const actualArray = JSON.parse(editor.document.getText());
  expect(actualArray).to.deep.equal(expectedArray);
  expect(actualArray).to.deep.equal(result);
}
