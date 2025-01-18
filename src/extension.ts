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
import { addIndex, WithIndexArray } from './indexArray';

// Return value was implemented to improve testability.
function sort(
    sortFn: (window: typeof vscode.window, workspace: typeof vscode.workspace, array: WithIndexArray) => Promise<WithIndexArray | undefined>):
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
        const [parsedArray, positions] = processAndParseArray(text, fileExtension);
        

        const sortedArray  = await sortFn(window, workspace, addIndex(parsedArray));
        if (sortedArray === undefined) {
          // User aborted somewhere
          return;
        }
        const workspaceEdit = new vscode.WorkspaceEdit();
        const serializedArray = serializeArray(sortedArray, fileExtension, text, positions);
        workspaceEdit.replace(editor.document.uri, selection, serializedArray);
        const success = await workspace.applyEdit(workspaceEdit);
        if (success) {
          // Restore cursor position
          editor.selection = new vscode.Selection(cursorPosition, cursorPosition);
          window.showInformationMessage('Successfully sorted array!');
          return sortedArray;
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
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): ExtensionApi {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const ascendingSort = vscode.commands.registerCommand('extension.sortJsonArrayAscending', sort(sortAscending));
  const descendingSort = vscode.commands.registerCommand('extension.sortJsonArrayDescending', sort(sortDescending));
  const customSort = vscode.commands.registerCommand('extension.sortJsonArrayCustom', sort(sortCustom(context)));

  context.subscriptions.push(ascendingSort);
  context.subscriptions.push(descendingSort);
  context.subscriptions.push(customSort);

  return {
    getGlobalStoragePath() {
      return context.globalStoragePath;
    },
  };
}
