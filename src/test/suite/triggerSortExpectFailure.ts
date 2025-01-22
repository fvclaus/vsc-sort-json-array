import * as vscode from 'vscode';

const window = vscode.window;

import chai = require('chai');
import sinon = require('sinon');
const expect = chai.expect;
const showErrorMessageSpy = sinon.spy(window, 'showErrorMessage');



export async function triggerSortExpectFailure(content: string, expectedErrorMessage: RegExp): Promise<void> {
  const document = await vscode.workspace.openTextDocument({
    language: 'JSON',
    content: content,
  });
  await window.showTextDocument(document);
  await vscode.commands.executeCommand('editor.action.selectAll');
  // Command does not throw otherwise user will be presented with dialog.
  await vscode.commands.executeCommand('extension.sortJsonArrayAscending');
  expect(showErrorMessageSpy.lastCall.args[0]).to.satisfy((msg: string) => expectedErrorMessage.test(msg));
}
