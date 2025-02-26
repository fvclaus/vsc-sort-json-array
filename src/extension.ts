'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import TextEditor = vscode.TextEditor;
import {sortCustom} from './sortCustom';
import {sortAscending, sortDescending} from './sortOrder';
import {searchEnclosingArray} from './searchEnclosingArray';
import processAndParseArray from './processAndParseArray';
import serializeArray from './serializeArray';
import {FileExtension} from './fileExtension';
import { ArrayItem, convertToLiteralValues } from './parser/parseArray';
import { isQuickPickOpen } from './showQuickPick';


function calculateIndentOfStartingLine(editor: vscode.TextEditor, selection: vscode.Range): {indentLevel: number, newIndent: string } {
  const options = editor.options;
  
  const startingLine = editor.document.lineAt(selection.start.line);
  const match = /^(\s)*/.exec(startingLine.text);
  let indentLevel = 0;
  // indentSize was released in 1.74: https://code.visualstudio.com/updates/v1_74#_new-indent-size-setting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indentOrTabSize = 'indentSize' in options? (options as any).indentSize : options.tabSize;
  if (match !== null) {
    // .replaceAll not available in 1.44.0
    const indent = match[0].replace(/\t/g, " ".repeat(indentOrTabSize));
    indentLevel = Math.ceil(indent.length / indentOrTabSize);
  }

  const indentType = options.insertSpaces === false? '\t' : ' '.repeat(indentOrTabSize);
  return {indentLevel, newIndent: indentType};
}

// Return value was implemented to improve testability.
function sort(
  extensionContext: vscode.ExtensionContext,
  sortFn: (extensionContext: vscode.ExtensionContext, window: typeof vscode.window, 
      workspace: typeof vscode.workspace, array: ArrayItem[]) => Promise<ArrayItem[] | undefined>):
    () => Promise<unknown[] | undefined> {
  return async function() {
    const fail = (error: string | Error | string[]): undefined => {
      let errors: string[];
      if (typeof error === 'string') {
        errors = [error];
      } else if (error instanceof Error) {
        errors = [error.message];
      } else {
        errors = error;
      }
      errors.forEach(window.showErrorMessage);
      // Must resolve, otherwise vsc will display another error message
      return undefined;
    };
    const window = vscode.window;
    const workspace = vscode.workspace;
    // The code you place here will be executed every time your command is executed
    if (window.activeTextEditor == null) {
      return fail('No text editor is active');
    } else {
      try {
        const editor = window.activeTextEditor as TextEditor;
        const document = editor.document;
        const fileExtension = FileExtension.getFileExtension(document.fileName);

        let selection: vscode.Range = editor.selection;
        // Must store cursor position before changing selection
        const cursorPosition = (selection as vscode.Selection).active;
        if (selection.isEmpty) {
          selection = await searchEnclosingArray(document, editor.selection, fileExtension);
        }

        const text = document.getText(selection);
        const parsedArray = processAndParseArray(text, fileExtension);
        

        const sortedArray  = await sortFn(extensionContext, window, workspace, parsedArray);
        if (sortedArray === undefined) {
          // User aborted somewhere
          return;
        }
        const serializedArray = serializeArray(sortedArray, fileExtension, text, 
            calculateIndentOfStartingLine(editor, selection));

        // textEditor.edit doesn't work for custom sort, because the editor is not active when the sorting is triggered.
        // WorkspaceEdit takes care of line endings
        const workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.replace(editor.document.uri, selection, serializedArray);
        const success = await workspace.applyEdit(workspaceEdit);
        if (success) {
          // Restore cursor position
          editor.selection = new vscode.Selection(cursorPosition, cursorPosition);
          // Must not await this otherwise it will hang until the user clicks it away.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          window.showInformationMessage('Successfully sorted array!');
          return convertToLiteralValues(sortedArray);
        } else {
          return fail('Could not apply workspace edit');
        }
      } catch (error) {
        return fail(error as Error);
      }
    }
  };
}

export interface ExtensionApi {
    getGlobalStoragePath: () => string;
    isQuickPickOpen: () => boolean;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): ExtensionApi {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const ascendingSort = vscode.commands.registerCommand('extension.sortJsonArrayAscending', sort(context, sortAscending));
  const descendingSort = vscode.commands.registerCommand('extension.sortJsonArrayDescending', sort(context, sortDescending));
  const customSort = vscode.commands.registerCommand('extension.sortJsonArrayCustom', sort(context, sortCustom));

  context.subscriptions.push(ascendingSort);
  context.subscriptions.push(descendingSort);
  context.subscriptions.push(customSort);

  return {
    getGlobalStoragePath() {
      return context.globalStoragePath;
    },
    // This exists only to make the tests more reliable
    isQuickPickOpen() {
      return isQuickPickOpen(context);
    }
  };
}
