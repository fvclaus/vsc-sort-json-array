import * as vscode from 'vscode';

const window = vscode.window;

import chai = require('chai');
const expect = chai.expect;

export async function triggerSortCommandExpectFailure(content: string, expectedErrorMessage: string): Promise<void> {
  const document = await vscode.workspace.openTextDocument({
    language: 'JSON',
    content: content,
  });
  await window.showTextDocument(document);
  await vscode.commands.executeCommand('editor.action.selectAll');
  let hasError = false;
  try {
    await vscode.commands.executeCommand('extension.sortJsonArrayAscending');
  } catch (e) {
    hasError = true;
    expect((e as Error).message).to.equal(expectedErrorMessage);
  }
  expect(hasError).to.be.true;
}
