'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import QuickPickItem = vscode.QuickPickItem;
import TextEditor = vscode.TextEditor;

/* interface Array<T> {
    flatMap<E>(callback: (t: T) => E[]): E[]
} */

function intersection<E> (setA : Set<E>, setB : Set<E>) {
    var _intersection = new Set();
    for (var elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "sort-json-array" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sortJsonArray', () => {
        const window = vscode.window;
        // The code you place here will be executed every time your command is executed
        if (!window.activeTextEditor) {
            window.showErrorMessage('No text editor is active');
        } else {
            let editor = window.activeTextEditor as TextEditor;
            let selection = editor.selection;
            let text = editor.document.getText(selection);

            try {
                let parsedJson = JSON.parse(text);
                if (parsedJson.constructor === Array) {
                    const parsedArray = (parsedJson as any[]);
                    const commonProperties = parsedArray
                        .map(o  => new Set(Object.getOwnPropertyNames(o)))
                        // Intersection is associative
                        .reduce((a, b) => intersection(a, b));
                    const quickPickItems = Array.from(commonProperties)
                        .map(property => ({
                            label: property
                        } as QuickPickItem));
                    if (quickPickItems.length === 0) {
                        window.showErrorMessage(`There are no properties all objects of this array have in common.`);
                    } else {
                        window.showQuickPick(quickPickItems, {
                            canPickMany: false,
                            placeHolder: 'Pick property from list to define sort order.'
                        }).then(selectedItem => {
                            if (selectedItem) {
                                const selectedProperty = selectedItem.label;
                                parsedArray.sort((a, b) => {
                                    const aValue = a[selectedProperty];
                                    const bValue = b[selectedProperty];
                                    if (aValue > bValue) {
                                        return 1;
                                    } else if (aValue < bValue) {
                                        return -1;
                                    } else {
                                        return 0;
                                    }
                                });
                                editor.edit(edit => {
                                    edit.replace(selection, JSON.stringify(parsedArray, null, editor.options.tabSize));
                                });
                            }

                        });
                    }
                } else {
                    window.showErrorMessage(`Selection is a ${parsedJson.constructor} not an array.`);
                }

            } catch (error) {
                window.showErrorMessage('Cannot parse selection as JSON.');
            }
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}