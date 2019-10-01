import * as vscode from 'vscode'
import chai = require('chai');
import { sleep } from './sleep';
const expect = chai.expect;

const window = vscode.window;

export async function triggerSortCommandExpectSuccess(array: any[], expectedArray: any[], userInputs?: () => Promise<any> | undefined) {
    const document = await vscode.workspace.openTextDocument({
      language: 'JSON',
      content: JSON.stringify(array, null, 2)
    })
    const editor = await window.showTextDocument(document);
    await vscode.commands.executeCommand('selectAll');
    // The sort command may require input from the user. We cannot 'await' it, because it will hang indefinetely.
    let result;
    if (userInputs) {
      const resultPromise = vscode.commands.executeCommand('extension.sortJsonArray');
      await userInputs();
      result = await resultPromise;

    } else {
      result = await vscode.commands.executeCommand('extension.sortJsonArray');
    }
    // Wait here is required to update the editor?
    await sleep(1000);
    const actualArray = JSON.parse(editor.document.getText())
    expect(actualArray).to.deep.equal(expectedArray);
    expect(actualArray).to.deep.equal(result);
  }