import * as vscode from 'vscode';

export const window = vscode.window;

import { expectErrorMessage, setupSpies } from './setupSpies';
import { waitForActiveExtension } from './waitForActiveExtension';

export async function triggerSortExpectFailure(content: string, expectedErrorMessage: RegExp): Promise<void> {
  setupSpies();
  await waitForActiveExtension();
  const document = await vscode.workspace.openTextDocument({
    language: 'JSON',
    content: content,
  });
  await window.showTextDocument(document);
  await vscode.commands.executeCommand('editor.action.selectAll');
  // Command does not throw otherwise user will be presented with dialog.
  await vscode.commands.executeCommand('extension.sortJsonArrayAscending');
  expectErrorMessage(expectedErrorMessage);
}
