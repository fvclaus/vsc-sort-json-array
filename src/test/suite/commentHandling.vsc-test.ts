import {afterEach} from 'mocha';

import * as vscode from "vscode";

import {closeActiveEditor, openNewDocument} from './textEditorUtils';
import { triggerSortExpectSuccess } from './triggerSortExpectSuccess';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { undent } from './undent';

suite('Comment Handling Integration Tests', function() {
  afterEach(async () => {
    await closeActiveEditor();
    sinon.restore(); // Restore any stubs/spies after each test
  });

  test('should sort string array and preserve comments', async function() {
    const originalJson = undent`
    [
    // before b
    "b", // inline b
    // before a
    "a", // inline a
    // after last
    ]`;
    const expectedJson = undent`
    [
      // before a
      "a", // inline a
      // before b
      "b" // inline b
      // after last
    ]`;

    await triggerSortExpectSuccess({
      command: 'extension.sortJsonArrayAscending',
      code: originalJson,
      expectedCode: expectedJson,
      position: new vscode.Position(1, 0),
      fileExtension: '.js' 
    });
  });

  test('should sort object array and preserve comments', async function() {
    const originalJson = `[ // start of array
    // comment 1 before id 2 object
    // comment 2 before id 2 object
  { // comment start of id 2
    // comment before id 2
    "id": 2, // comment for id 2
    // comment between id 2 and dataId2
    "dataId2": { // comment start of dataId2
      "value": "zeta" // comment for zeta
    } // comment end of dataId2
  },// comment end of id 2
  // comment before id 1 object
  {   // comment start of id 1
    // comment before id 1
    "id": 1, // comment for id 1
          // comment between id 1 and dataId1
    "dataId1": { // comment start of dataId1
      "value": "alpha" // comment for alpha
    } // comment end of dataId1
  } // comment end of id 1 object
    // comment at the end
]`;
    const expectedJson = `[ // start of array
  // comment before id 1 object
  { // comment start of id 1
    // comment before id 1
    "id": 1, // comment for id 1
    // comment between id 1 and dataId1
    "dataId1": { // comment start of dataId1
      "value": "alpha" // comment for alpha
    } // comment end of dataId1
  }, // comment end of id 1 object
  // comment 1 before id 2 object
  // comment 2 before id 2 object
  { // comment start of id 2
    // comment before id 2
    "id": 2, // comment for id 2
    // comment between id 2 and dataId2
    "dataId2": { // comment start of dataId2
      "value": "zeta" // comment for zeta
    } // comment end of dataId2
  } // comment end of id 2
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
    expect(showErrorMessageStub.getCall(0).args[0]).to.include('Comments are not supported in JSONL files.');
  });
});