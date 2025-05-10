import {afterEach} from 'mocha';

import * as vscode from "vscode";

import {closeActiveEditor, openNewDocument} from './textEditorUtils';
import { triggerSortExpectFailure } from './triggerSortExpectFailure';
import { triggerSortExpectSuccess, triggerSortJsonExpectSuccess } from './triggerSortExpectSuccess';
import { expect } from 'chai';
import { SortCommand } from './SortCommands';
import { waitForActiveExtension } from './waitForActiveExtension';
import * as sinon from 'sinon';

suite('Extension Test Suite', function() {
  afterEach(async () => {
    await closeActiveEditor();
    sinon.restore(); // Restore any stubs/spies after each test
  });

  test('Invalid json', async function() {
    await triggerSortExpectFailure('[\'foo, 2, 3]', /Cannot parse selection as JSON array. Reason: no viable alternative at input '\['/)
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

  suite('Comment Handling Integration Tests', function() {
    test('should sort JSON array and preserve comments', async function() {
      const originalJson = '[\n  // before b\n  "b", // inline b\n  // before a\n  "a", // inline a\n  // after last\n]';
      const expectedJson = '[\n  // before a\n  "a", // inline a\n  // before b\n  "b", // inline b\n  // after last\n]';

      await triggerSortExpectSuccess(
        {
          command: 'extension.sortJsonArrayAscending',
          fileExtension: '.js',
          expectedCode: expectedJson,
          code: originalJson,
          position: new vscode.Position(0, 0)
        }
      );
    });

    test('should show error message for JSONL with comments', async function() {
      const jsonlWithComment = '{"a": 1}\n// This is a comment\n{"b": 2}';
      const showErrorMessageStub = sinon.stub(vscode.window, 'showErrorMessage');

      await openNewDocument(jsonlWithComment, '.jsonl');
      await vscode.commands.executeCommand('extension.sortJsonArrayAscending'); // Trigger any sort command

      expect(showErrorMessageStub.calledOnce).to.be.true;
      expect(showErrorMessageStub.getCall(0).args[0]).to.equal('Comments are not supported in JSONL files. Each line must be a valid JSON object.');
    });
  });
});
