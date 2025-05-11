import {afterEach} from 'mocha';

import * as vscode from "vscode";

import {closeActiveEditor, openNewDocument} from './textEditorUtils';
import { triggerSortExpectSuccess } from './triggerSortExpectSuccess';
import { expect } from 'chai';
import * as sinon from 'sinon';

suite('Comment Handling Integration Tests', function() {
  afterEach(async () => {
    await closeActiveEditor();
    sinon.restore(); // Restore any stubs/spies after each test
  });

  test('should sort JSON array and preserve comments', async function() {
    const originalJson = '[\n  // before b\n  "b", // inline b\n  // before a\n  "a", // inline a\n  // after last\n]';
    const expectedJson = '[\n  // before a\n  "a", // inline a\n  // before b\n  "b", // inline b\n  // after last\n]';

    await triggerSortExpectSuccess({
      command: 'extension.sortJsonArrayAscending', // Test with ascending sort
      code: originalJson,
      expectedCode: expectedJson,
      position: new vscode.Position(0, 0), // Start position for selection
      fileExtension: '.json' // Or appropriate file extension
    });
  });

  test.only('should sort array with nested objects and preserve inline comments', async function() {
    const originalJson = `[
    // comment before id 2 object
  {
    // comment before id 2
    "id": 2, // comment for id 2
    "dataId2": {
      "value": "zeta" // comment for zeta
    } // comment for data object of id 2
  },
  // comment before id 1 object
  {
    // comment before id 1
    "id": 1, // comment for id 1
    "dataId1": {
      "value": "alpha" // comment for alpha
    } // comment for data object of id 1
  }
    // comment at the end
]`;
    const expectedJson = `[
  // comment before id 1 object
  {
    // comment before id 1
    "id": 1, // comment for id 1
    "dataId1": {
      "value": "alpha" // comment for alpha
    } // comment for data object of id 1
  },
  // comment before id 2 object
  {
    "id": 2, // comment for id 2
    "dataId2": {
      "value": "zeta" // comment for zeta
    } // comment for data object of id 2
  }
  // comment at the end
]`;
    await triggerSortExpectSuccess({
      command: 'extension.sortJsonArrayAscending', // Sorts by id
      code: originalJson,
      expectedCode: expectedJson,
      position: new vscode.Position(0, 0),
      fileExtension: '.json'
    });
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