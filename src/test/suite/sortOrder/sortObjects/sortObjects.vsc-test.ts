import * as vscode from 'vscode';
import {ALL, JIMMY, JOHN_PAUL, JOHN, ROBERT} from './lz';

import {triggerSortJsonExpectSuccess, triggerSortJsExpectSuccess, triggerSortExpectSuccess} from '../../triggerSortExpectSuccess';

import {afterEach} from 'mocha';

import {triggerSortExpectFailure} from '../../triggerSortExpectFailure';
import nextTick from '../../nextTick';
import {closeActiveEditor} from '../../textEditorUtils';
import { undent } from '../../undent';
import { selectQuickOpenItems } from '../../sortCustom/selectQuickOpenItem';
import { sleep } from '../../sleep';

async function changeToCRLF(): Promise<void> {
  await vscode.commands.executeCommand("workbench.action.showCommands");
  await sleep(1000);
  await selectQuickOpenItems("Change End of Line Sequence", "CRLF");
}

suite('Sort objects', function() {
  afterEach(async () => {
    await closeActiveEditor();
  });

  test('should sort using name and age', async function() {
    await triggerSortJsonExpectSuccess('extension.sortJsonArrayAscending', ALL, [JIMMY, JOHN, JOHN_PAUL, ROBERT], async function operateQuickOpen() {
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
    await triggerSortExpectSuccess({
      code: undent`
        {"id": 5}
        {"id": 1}
        {"id": 2}
      `,
      fileExtension: '.jsonl',
      position: new vscode.Position(0, 0),
      command: 'extension.sortJsonArrayAscending',
      expectedCode: undent`
        {"id": 1}
        {"id": 2}
        {"id": 5}
      `
    });
  });

  test("should sort with CRLF", async function() {
    await triggerSortExpectSuccess({
      command: "extension.sortJsonArrayAscending",
      code: "const array = [1,\r\n 2,\r\n 3];", 
      position: new vscode.Position(0, 15),
      fileExtension: '.js',
      expectedCode: "const array = [\r\n  1,\r\n  2,\r\n  3\r\n];",
      beforeActions: changeToCRLF
    })
  });

  test("should sort JSONL with CRLF", async function() {
    await triggerSortExpectSuccess({
      command: "extension.sortJsonArrayAscending", 
      code: `{id: 5}\r\n{id: 1}\r\n{id: 3}`,
      position: new vscode.Position(0, 3),
      expectedCode: `{id: 1}\r\n{id: 3}\r\n{id: 5}`, 
      fileExtension: '.jsonl',
      beforeActions: changeToCRLF
    });
  })

  test("should sort JSONL with mixed line endings", async function() {
    await triggerSortExpectSuccess({
      command: "extension.sortJsonArrayAscending",
      code: `{id: 5}\r\n{id: 1}\n{id: 3}\n{id: 4}`,
      position: new vscode.Position(0, 3),
      expectedCode: `{id: 1}\n{id: 3}\n{id: 4}\n{id: 5}`, 
      fileExtension: ".jsonl"
    });
  })


  test("should sort JS array with tabs", async function() {
    await triggerSortExpectSuccess({
      code: undent`
      function main() {
      \tfor (const i = 0; i < 100; i++) {
      \t\tconst array = [
      \t\t\t{ id: 5},
      \t\t\t{ id: 2},
      \t\t\t{ id: 1}
      \t\t]
      \t}
      }`,
      command: 'extension.sortJsonArrayAscending',
      fileExtension: '.js',
      position: new vscode.Position(3, 4),
      configureTextEditor(editor) {
        editor.options.insertSpaces = false;
      },
      expectedCode: undent`
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
      }`
    })
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

  test("jsx", async function () {
    await triggerSortExpectSuccess({
      code: undent`
        const LINKS = [{
          href: "/terms-and-conditions",
          label: "Terms and Conditions"
        }, {
          href: "/about-us",
          label: "About us"
        }]

        export function Navigation() {
          return <nav>
            <ul>
                {LINKS.map(l => (
                    <li><a href={l.href}>{l.label}</a></li>
                ))}
            </ul>
          </nav>
        }`,
      command: 'extension.sortJsonArrayAscending',
      position: new vscode.Position(1, 0),
      async userInputs() {
        await selectQuickOpenItems("label");
      },
      expectedCode: undent`
        const LINKS = [
          {
            href: "/about-us",
            label: "About us"
          },
          {
            href: "/terms-and-conditions",
            label: "Terms and Conditions"
          }
        ]

        export function Navigation() {
          return <nav>
            <ul>
                {LINKS.map(l => (
                    <li><a href={l.href}>{l.label}</a></li>
                ))}
            </ul>
          </nav>
        }`,
        fileExtension: '.jsx',
    })
  })
});
