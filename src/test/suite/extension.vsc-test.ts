import {afterEach} from 'mocha';

import * as vscode from "vscode";

import {closeActiveEditor, openNewDocument} from './textEditorUtils';
import { triggerSortExpectFailure } from './triggerSortExpectFailure';
import { triggerSortJsonExpectSuccess } from './triggerSortExpectSuccess';
import { expect } from 'chai';
import { SortCommand } from './SortCommands';
import { waitForActiveExtension } from './waitForActiveExtension';


suite('Extension Test Suite', function() {
  afterEach(async () => {
    await closeActiveEditor();
  });

  test('Invalid json', async function() {
    await triggerSortExpectFailure('[\'foo, 2, 3]', /Cannot parse selection as JSON array. Reason: Error in 1, 1: no viable alternative at input '\['/)
  });

  test('Valid json', async function() {
    await triggerSortJsonExpectSuccess(
      'extension.sortJsonArrayAscending',
      [
        {
          id: 3,
        }, {
          id: 4,
        }, {
          id: 1,
        }
      ], 
      [{id: 1}, {id: 3}, {id: 4}]);
  });

  const extensionCommands: SortCommand[] = ["extension.sortJsonArrayAscending", 'extension.sortJsonArrayCustom', 'extension.sortJsonArrayDescending'];

  test('command should not be visible in txt file', async function () {
    await waitForActiveExtension();
    await openNewDocument('Hello, World!', '.txt');
    const commands = await vscode.commands.getCommands();
    expect(commands).not.contains(extensionCommands);
  });

  [".jsx", ".js", ".ts", ".tsx"].forEach(extension => {
    test(`commands should be visible in ${extension}`, async function() {
      await waitForActiveExtension();
      await openNewDocument('[1, 2, 3]', extension);
      const commands = await vscode.commands.getCommands();
      expect(commands).to.include.members(extensionCommands);
    })
  })
});
