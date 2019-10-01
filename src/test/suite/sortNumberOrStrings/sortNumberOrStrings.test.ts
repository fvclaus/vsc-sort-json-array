import * as vscode from 'vscode'

import { triggerSortCommandExpectSuccess } from '../triggerSortCommandExpectSucccess';

import { afterEach } from 'mocha';

suite('Sort number or strings', () => {
  afterEach(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  });

  test('should sort numbers', async () => {
    await triggerSortCommandExpectSuccess([100, 1, 99], [1, 99, 100])
  });

  test('should sort strings', async () => {
    await triggerSortCommandExpectSuccess(['foo', 'bar', 'car'], ['bar', 'car', 'foo']);
  });

});