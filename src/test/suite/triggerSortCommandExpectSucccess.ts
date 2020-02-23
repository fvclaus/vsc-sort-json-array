import * as vscode from 'vscode'
import chai = require('chai');
import { sleep } from './sleep';
const expect = chai.expect;
import openNewJsonDocument from './openNewJsonDocument'

export async function triggerSortCommandExpectSuccess(command: string, array: any[], expectedArray: any[], userInputs?: () => Promise<any> | undefined) {
  const {
    editor
  } = await openNewJsonDocument(JSON.stringify(array, null, 2));
  await vscode.commands.executeCommand('selectAll');
  // The sort command may require input from the user. We cannot 'await' it, because it will hang indefinetely.
  let result;
  if (userInputs) {
    const resultPromise = vscode.commands.executeCommand(command);
    await userInputs();
    result = await resultPromise;
  } else {
    result = await vscode.commands.executeCommand(command);
  }
  // Wait here is required to update the editor?
  await sleep(1000);
  const actualArray = JSON.parse(editor.document.getText())
  expect(actualArray).to.deep.equal(expectedArray);
  expect(actualArray).to.deep.equal(result);
}