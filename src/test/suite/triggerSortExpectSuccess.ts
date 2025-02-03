import * as vscode from 'vscode';
import chai = require('chai');
export const expect = chai.expect;
import {openNewDocument} from './textEditorUtils';
import nextTick from './nextTick';
import { expectZeroInvocations, setupSpies } from './setupSpies';
import { waitForActiveExtension } from './waitForActiveExtension';
import { waitForQuickPick } from './waitForQuickPick';


type SortCommands = 'extension.sortJsonArrayAscending' | 'extension.sortJsonArrayDescending' | 'extension.sortJsonArrayCustom';


export type Config = {
  command: SortCommands,
  code: string,
  position: vscode.Position,
  expectedCode: string,
  fileExtension: string,
  beforeActions?: () => Promise<void>,
  userInputs?: () => Promise<unknown> | undefined,
  configureTextEditor?: (editor: vscode.TextEditor) => void
}

export async function triggerSortExpectSuccess(
  config: Config
): Promise<unknown> {
  const {showErrorMessageSpy} = setupSpies();
  const ext = await waitForActiveExtension();
  const {
      editor,
    } = await openNewDocument(config.code, config.fileExtension);

    editor.selection = new vscode.Selection(config.position, config.position);

    if (config.configureTextEditor == null) {
      editor.options.tabSize = 2;
      editor.options.insertSpaces = true;
    } else {
      await config.configureTextEditor(editor);
    }

    if (config.beforeActions != null) {
      await config.beforeActions();
    }

    const resultPromise = vscode.commands.executeCommand(config.command);
    if (config.userInputs != null) {
      await waitForQuickPick(ext);
      await config.userInputs();
    }
    const ret = await resultPromise;

    expectZeroInvocations(showErrorMessageSpy);
    // Wait here is required to update the editor?
    await nextTick();
    const editorText = editor.document.getText();
    expect(editorText).to.be.equal(config.expectedCode);
    return ret;
}


/**
 * 
 * @deprecated Use {@code triggerSortExpectSuccess} instead
 */
export async function triggerSortJsExpectSuccess(
  command: SortCommands,
  code: string,
  position: vscode.Position,
  expectedCode: string,
  userInputs?: () => Promise<unknown> | undefined
): Promise<void> {
  await triggerSortExpectSuccess({
    code,
    command,
    position,
    expectedCode,
    userInputs,
    fileExtension: '.js'
  })
}

export async function triggerSortJsonExpectSuccess(
    command: SortCommands,
    array: unknown[],
    expectedArray: unknown[],
    userInputs?: () => Promise<unknown> | undefined): Promise<void> {
  const result = await triggerSortExpectSuccess({
    code: JSON.stringify(array, null, 2),
    command,
    position: new vscode.Position(0, 0),
    async beforeActions() {
      await vscode.commands.executeCommand('editor.action.selectAll');
    },
    userInputs,
    fileExtension: '.json',
    expectedCode: JSON.stringify(expectedArray, null, 2)
  })
  expect(result).to.deep.equal(expectedArray);
}
