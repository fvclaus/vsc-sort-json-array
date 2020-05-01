import * as vscode from 'vscode'

import { triggerSortCommandExpectSuccess } from '../../triggerSortCommandExpectSucccess';

import { afterEach } from 'mocha';
import { closeActiveEditor } from '../../textEditorUtils';

suite('Sort number or strings', () => {
  afterEach(async () => {
    await closeActiveEditor();
  });

  test('should sort numbers', async () => {
    await triggerSortCommandExpectSuccess('extension.sortJsonArrayAscending', [100, 1, 99], [1, 99, 100])
  });

  test('should sort strings', async () => {
    await triggerSortCommandExpectSuccess('extension.sortJsonArrayAscending', ['foo', 'bar', 'car'], ['bar', 'car', 'foo']);
  });

});