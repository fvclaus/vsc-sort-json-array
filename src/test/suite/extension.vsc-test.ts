import {afterEach} from 'mocha';

import * as vscode from 'vscode';
import chai = require('chai');
import {closeActiveEditor, openNewJsonDocument} from './textEditorUtils';
import {FileExtension} from '../../fileExtension';
import stringifyArray from './stringify';
import { triggerSortExpectFailure } from './triggerSortExpectFailure';
const expect = chai.expect;


suite('Extension Test Suite', function() {
  afterEach(async () => {
    await closeActiveEditor();
  });

  test('Invalid json', async function() {
    await triggerSortExpectFailure('[\'foo, 2, 3]', /Cannot parse selection as JSON array. Reason: no viable alternative at input '\['/)
  });

  test('Valid json', async function() {
    const {editor} = await openNewJsonDocument(stringifyArray([
      {
        id: 3,
      }, {
        id: 4,
      }, {
        id: 1,
      }], FileExtension.OTHER));
    const position = new vscode.Position(2, 4);
    editor.selection = new vscode.Selection(position, position);
    const sortedArray = await vscode.commands.executeCommand('extension.sortJsonArrayAscending') as {id: number}[];
    expect(sortedArray.map((el) => el.id)).to.deep.equal([1, 3, 4]);
  });
});
