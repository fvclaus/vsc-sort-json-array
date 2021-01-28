import chai = require('chai');
const expect = chai.expect;
import {afterEach} from 'mocha';
import {closeActiveEditor, openNewJsonDocument} from './textEditorUtils';
import {searchEnclosingArray} from '../../searchEnclosingArray';
import * as vscode from 'vscode';
import nextTick from './nextTick';
import {FileExtension} from '../../fileExtension';
import stringifyArray from './stringify';

suite('Find enclosing array', function() {
  const positionCursorAtText = async (document: vscode.TextDocument, editor: vscode.TextEditor, text: string) => {
    const offset = document.getText().indexOf(text);
    const position = document.positionAt(offset);
    editor.selection = new vscode.Selection(position, position);
    await nextTick();
    return position;
  };

  const version = vscode.version;


  afterEach(async () => {
    await closeActiveEditor();
    Object.defineProperty(vscode, 'version', {
      value: version,
    });
  });

  ([
    [
      [
        {
          id: 1,
        }, {
          id: 2,
        }, {
          id: 3,
        },
      ], '"id": 1',
    ],
    [
      [
        {
          id: 1,
          array: [1, 2, 3],
        },
        {
          id: 2,
          array: [1, 2, 3],
        },
      ], '"id": 2',
    ],
    [
      [
        '1',
        '2',
        '3',
      ], '"2"'],
    [
      [
        'foo',
        'bar',
      ], '"bar"',
    ],
    [
      [
        [
          {
            id: 1,
            array: ['foo', 'bar'],
          },
          {
            id: 2,
          },
        ],
      ], '"foo"', new vscode.Position(4, 15), new vscode.Position(7, 7),
    ],
    [
      [
        {
          id: 1,
        }, {
          id: 2,
        }, {
          id: 3,
        },
      ], '"id": 1', undefined, undefined, FileExtension.JSONL,
    ],
  ] as [unknown[], string, vscode.Position?, vscode.Position?, FileExtension?][])
      .forEach(([array, textAtPosition, expectedStart, expectedEnd, fileExtension = FileExtension.JSON]) => {
        const content = stringifyArray(array, fileExtension);
        test(`should find enclosing root array ${content}`, async function() {
          const {
            document,
            editor,
          } = await openNewJsonDocument(content);
          const position = await positionCursorAtText(document, editor, textAtPosition as string);
          const enclosingArray = await searchEnclosingArray(document, new vscode.Selection(position, position), fileExtension);
          expect(enclosingArray.start).to.deep.equal(expectedStart != null ? expectedStart : new vscode.Position(0, 0));
          expect(enclosingArray.end).to.deep.equal(expectedEnd != null ? expectedEnd : document.lineAt(document.lineCount - 1).range.end);
        });
      });

  async function expectError(content: string, msgPrefix: string) {
    const {
      document,
    } = await openNewJsonDocument(content);
    const position = new vscode.Position(0, 0);
    let hasError = false;
    try {
      await searchEnclosingArray(document, new vscode.Selection(position, position), FileExtension.JSON);
    } catch (e) {
      expect(e.message).to.satisfy((msg: string) => msg.startsWith(msgPrefix));
      hasError = true;
    }
    expect(hasError).to.be.true;
  }

  test('should fail for vscode < 1.44', async function() {
    Object.defineProperty(vscode, 'version', {
      value: '1.38',
    });
    await expectError('foo', 'Auto detection does not work in version');
  });

  test('should fail for empty selection', async function() {
    await expectError('{"a": 1}', 'No enclosing array could be found');
  });
});
