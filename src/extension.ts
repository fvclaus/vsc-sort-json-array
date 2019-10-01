'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Window = vscode.window;
import TextEditor = vscode.TextEditor;
import { ArrayType, determineArrayType } from './determineArrayType';
import { SortOrder } from './SortOrder';
import { sortObjects } from './sortObjects';
import { sortNumberOrStrings } from './sortNumberOrStrings';

function sortArray(window: typeof Window, array: any[], sortOrder: SortOrder): Promise<any[]> {
    const arrayType = determineArrayType(array);
    switch (arrayType) {
        case ArrayType.object:
            return sortObjects(window, array, sortOrder);
        case ArrayType.number:
        case ArrayType.string:
            return sortNumberOrStrings(window, array, arrayType, sortOrder);
        default:
            return Promise.reject(`This array is not yet supported.`);
    }
}

// Return value was implemented to improve testability.
function sort(sortOrder: SortOrder): () => Promise<any[]> {
    return () => {
        return new Promise((resolve, reject) => {
            const fail = (errorMessage: string) => {
                window.showErrorMessage(errorMessage);
                reject(new Error(errorMessage));
            }
            const window = vscode.window;
            // The code you place here will be executed every time your command is executed
            if (!window.activeTextEditor) {
                fail('No text editor is active');
            } else {
                let editor = window.activeTextEditor as TextEditor;
                let selection = editor.selection;
                let text = editor.document.getText(selection);
    
                try {
                    let parsedJson = JSON.parse(text);
                    if (parsedJson.constructor === Array) {
                        const parsedArray = (parsedJson as any[]);
                        sortArray(window, parsedArray, sortOrder)
                            .then(sortedArray => {
                                editor.edit(edit => {
                                    edit.replace(selection, JSON.stringify(sortedArray, null, editor.options.tabSize));
                                    resolve(sortedArray);
                                })
                            })
                            .catch(error => {
                                fail(error)
                            })
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


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const ascendingSort = vscode.commands.registerCommand('extension.sortJsonArray', sort(SortOrder.ascending));
    const descendingSort = vscode.commands.registerCommand('extension.sortJsonArrayDescending', sort(SortOrder.descending));

    context.subscriptions.push(ascendingSort);
    context.subscriptions.push(descendingSort);
}

// this method is called when your extension is deactivated
export function deactivate() {
}