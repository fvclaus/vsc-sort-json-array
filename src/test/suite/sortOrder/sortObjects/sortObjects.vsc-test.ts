import * as vscode from 'vscode';
import {ALL, JIMMY, JOHN_PAUL, JOHN, ROBERT} from './lz';

import {triggerSortCommandExpectSuccess} from '../../triggerSortCommandExpectSuccess';

import {afterEach} from 'mocha';

import {triggerSortCommandExpectFailure} from '../../triggerSortCommandExpectFailure';
import nextTick from '../../nextTick';
import {closeActiveEditor} from '../../textEditorUtils';

suite('Sort objects', function() {
  afterEach(async () => {
    await closeActiveEditor();
  });

  test('should sort using name and age', async function() {
    await triggerSortCommandExpectSuccess('extension.sortJsonArrayAscending', ALL, [JIMMY, JOHN, JOHN_PAUL, ROBERT], async function operateQuickOpen() {
      // Wait for quick pick to become visible
      await nextTick();
      await vscode.commands.executeCommand('workbench.action.quickOpenSelectNext');
      await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
      await nextTick();
      return vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
    });
  });

  test('should show no common properties error message', async function() {
    triggerSortCommandExpectFailure(JSON.stringify([{'foo': 1}, {'bar': 2}], null, 2), `There are no properties all objects of this array have in common.`);
  });
});
