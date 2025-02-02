import * as vscode from 'vscode';

export const window = vscode.window;

import chai = require('chai');
import { setupSpies } from './setupSpies';
import { waitForActiveExtension } from './waitForActiveExtension';
const expect = chai.expect;

export async function triggerSortExpectFailure(content: string, expectedErrorMessage: RegExp): Promise<void> {
  const {showErrorMessageSpy} = setupSpies();
  await waitForActiveExtension();
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
