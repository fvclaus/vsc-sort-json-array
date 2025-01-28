import * as vscode from 'vscode';
import {ALL, JIMMY, JOHN_PAUL, JOHN, ROBERT} from './lz';

import {expect, triggerSortJsonExpectSuccess, triggerSortJsExpectSuccess} from '../../triggerSortExpectSuccess';

import {afterEach} from 'mocha';

import {triggerSortExpectFailure} from '../../triggerSortExpectFailure';
import nextTick from '../../nextTick';
import {closeActiveEditor, openNewDocument} from '../../textEditorUtils';
import { undent } from '../../undent';
import { selectQuickOpenItem } from '../../sortCustom/selectQuickOpenItem';

suite('Sort objects', function() {
  afterEach(async () => {
    await closeActiveEditor();
  });

  test('should sort using name and age', async function() {
    await triggerSortJsonExpectSuccess('extension.sortJsonArrayAscending', ALL, [JIMMY, JOHN, JOHN_PAUL, ROBERT], async function operateQuickOpen() {
      // Wait for quick pick to become visible
      await nextTick();
      await vscode.commands.executeCommand('workbench.action.quickOpenSelectNext');
      await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
      await nextTick();
      return vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
    });
  });

  test('should show no common properties error message', async function() {
    await triggerSortExpectFailure(JSON.stringify([{'foo': 1}, {'bar': 2}], null, 2), 
      /There are no properties all objects of this array have in common\./);
  });

  test("should sort JSONL", async function() {
    const {
      editor,
    } = await openNewDocument(undent`
      {"id": 5}
      {"id": 1}
      {"id": 2}
     `, '.jsonl');
    editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0));
    
    await vscode.commands.executeCommand('extension.sortJsonArrayAscending');
    // Wait here is required to update the editor?
    await nextTick();
    expect(editor.document.getText()).to.be.equal(undent`
      {"id": 1}
      {"id": 2}
      {"id": 5}
      `);
  });

  test("should sort with CRLF", async function() {
    await triggerSortJsExpectSuccess("extension.sortJsonArrayAscending", 
      "const array = [1,\r\n 2,\r\n 3];", new vscode.Position(0, 15),
      "const array = [\r\n  1,\r\n  2,\r\n  3\r\n];",
      async () => {
        await vscode.commands.executeCommand("workbench.action.showCommands");
        await selectQuickOpenItem("Change End of Line Sequence")
        await selectQuickOpenItem("CRLF");
      }
      )
  })


  test("should sort JS array with tabs", async function() {
    const {
      editor,
    } = await openNewDocument(undent`
      function main() {
      \tfor (const i = 0; i < 100; i++) {
      \t\tconst array = [
      \t\t\t{ id: 5},
      \t\t\t{ id: 2},
      \t\t\t{ id: 1}
      \t\t]
      \t}
      }`, '.js');
    editor.options.insertSpaces = false;
    editor.selection = new vscode.Selection(new vscode.Position(3, 4), new vscode.Position(3, 4));
    
    await vscode.commands.executeCommand('extension.sortJsonArrayAscending');
    // Wait here is required to update the editor?
    await nextTick();
    expect(editor.document.getText()).to.be.equal(undent`
      function main() {
      \tfor (const i = 0; i < 100; i++) {
      \t\tconst array = [
      \t\t\t{
      \t\t\t\tid: 1
      \t\t\t},
      \t\t\t{
      \t\t\t\tid: 2
      \t\t\t},
      \t\t\t{
      \t\t\t\tid: 5
      \t\t\t}
      \t\t]
      \t}
      }`);
  });

  test("should sort JS array", async function() {
    await triggerSortJsExpectSuccess('extension.sortJsonArrayAscending', undent`
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
      `,new vscode.Position(4, 9) , undent`
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
