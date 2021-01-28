import {afterEach} from 'mocha';

import * as vscode from 'vscode';
import chai = require('chai');
import {closeActiveEditor, openNewJsonDocument} from './textEditorUtils';
import sinon = require('sinon');
import {FileExtension} from '../../fileExtension';
import stringifyArray from './stringify';
const expect = chai.expect;


const window = vscode.window;

suite('Extension Test Suite', function() {
  afterEach(async () => {
    await closeActiveEditor();
  });

  test('Invalid json', async function() {
    await openNewJsonDocument('[\'foo, 2, 3]');
    const showErrorMessageSpy = sinon.spy(window, 'showErrorMessage');
    await vscode.commands.executeCommand('selectAll');
    await vscode.commands.executeCommand('extension.sortJsonArrayAscending');
    expect(showErrorMessageSpy.lastCall.args[0]).to.satisfy((msg: string) => msg.startsWith('Cannot parse selection as JSON array.'));
  });

  test('Valid json', async function() {
    const {editor} = await openNewJsonDocument(stringifyArray([
      {
        id: 3,
      }, {
        id: 4,
      }, {
        id: 1,
      }], FileExtension.JSON));
    const position = new vscode.Position(2, 4);
    editor.selection = new vscode.Selection(position, position);
    const sortedArray = await vscode.commands.executeCommand('extension.sortJsonArrayAscending') as {id: number}[];
    expect(sortedArray.map((el) => el.id)).to.deep.equal([1, 3, 4]);
  });
});
