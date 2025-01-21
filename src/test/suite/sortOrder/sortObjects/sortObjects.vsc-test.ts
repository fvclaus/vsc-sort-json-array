import * as vscode from 'vscode';
import {ALL, JIMMY, JOHN_PAUL, JOHN, ROBERT} from './lz';

import {expect, triggerSortCommandExpectSuccess} from '../../triggerSortCommandExpectSuccess';

import {afterEach} from 'mocha';

import {triggerSortCommandExpectFailure} from '../../triggerSortCommandExpectFailure';
import nextTick from '../../nextTick';
import {closeActiveEditor, openNewDocument} from '../../textEditorUtils';
import { undent } from '../../undent';

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

  // TODO Add test with tabs
  test("should sort JS array", async function() {
    const {
      editor,
    } = await openNewDocument(undent`
      function main() {
        while (true) {
          for (const i = 0; i < 100; i++) {
            const array = [
              { id: 5},
              { id: 2},
              { id: 1}
            ]
          }
        }
      }
      `, '.js');
    editor.options.tabSize = 2;
    editor.options.insertSpaces = true;
    editor.selection = new vscode.Selection(new vscode.Position(4, 9), new vscode.Position(4, 9));
    
    await vscode.commands.executeCommand('extension.sortJsonArrayAscending');
    // Wait here is required to update the editor?
    await nextTick();
    const editorText = editor.document.getText();
    expect(editorText).to.be.equal(undent`
      function main() {
        while (true) {
          for (const i = 0; i < 100; i++) {
            const array = [
              {
                id: 1
              },
              {
                id: 2
              },
              {
                id: 5
              }
            ]
          }
        }
      }
      `);
  })
});
