import * as vscode from 'vscode'
import chai = require('chai');
import { sleep } from './sleep';
const expect = chai.expect;
import * as temp from 'temp';
import * as fs from 'fs';

const window = vscode.window;

async function insertText(editor: vscode.TextEditor, content: string) {
  return new Promise((resolve) => {
    editor.edit(edit => {
      edit.replace(new vscode.Position(0, 0), content);
      resolve();
    })
  })
}

export async function triggerSortCommandExpectSuccess(command: string, array: any[], expectedArray: any[], userInputs?: () => Promise<any> | undefined) {
  const tempFile = temp.openSync({
    suffix: '.json'
  });
  fs.openSync(tempFile.path, 'a+');

  const document = await vscode.workspace.openTextDocument(tempFile.path);
  const editor = await window.showTextDocument(document);
  // Mark file as dirty to bypass preview mode that would open the sort module in the current tab.
  await insertText(editor, JSON.stringify(array, null, 2));
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