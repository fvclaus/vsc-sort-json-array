'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import TextEditor = vscode.TextEditor;
import { sortCustom } from './sortCustom';
import { sortAscending, sortDescending } from './sortOrder';
import { findArrayInText } from './findArrayInText';

// Return value was implemented to improve testability.
function sort(sortFn: (window: typeof vscode.window, workspace: typeof vscode.workspace, array: any[]) => Promise<any[]>): () => Promise<any[]> {
    return () => {
        return new Promise((resolve, reject) => {
            const fail = (error: string | string[]) => {
                let errors : string[];
                if (typeof error === 'string') {
                    errors = [error];
                } else {
                    errors = error;
                }
                errors.forEach(window.showErrorMessage);
                reject(new Error(errors.join(', ')));
            }
            const window = vscode.window;
            const workspace = vscode.workspace;
            // The code you place here will be executed every time your command is executed
            if (!window.activeTextEditor) {
                fail('No text editor is active');
            } else {
                const editor = window.activeTextEditor as TextEditor;
                const { document } = editor;
                let selection = editor.selection;
                const selectedText = document.getText(selection);
                const detectedText = findArrayInText(document.getText(), document.offsetAt(selection.active));
                if (detectedText) {
                    editor.selection = selection = new vscode.Selection(
                        document.positionAt(detectedText.start),
                        document.positionAt(detectedText.end)
                    )
                }
                const text = (detectedText && detectedText.text) || selectedText

                try {
                    let parsedJson = JSON.parse(text);
                    if (parsedJson.constructor === Array) {
                        const parsedArray = (parsedJson as any[]);
                        if (parsedArray.length === 0) {
                            fail("This is an empty array. No sort needed ;)")
                            return
                        }
                        sortFn(window, workspace, parsedArray)
                            .then(sortedArray => {
                                const workspaceEdit = new vscode.WorkspaceEdit();
                                workspaceEdit.replace(document.uri, selection, JSON.stringify(sortedArray, null, editor.options.tabSize));
                                workspace.applyEdit(workspaceEdit)
                                    .then(wasSuccess => {
                                        if (wasSuccess) {
                                            window.showInformationMessage('Sucessfully sorted array!');
                                            resolve(sortedArray);
                                        }
                                    });
                            })
                            .catch(fail)
                    } else {
                        fail(`Selection is a ${parsedJson.constructor} not an array.`);
                    }
                } catch (error) {
                    fail('Cannot parse selection as JSON.');
                }
            }
        });
    }
}

export interface ExtensionApi {
    getGlobalStoragePath: () => string;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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
        }
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}
