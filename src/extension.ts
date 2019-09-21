'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import TextEditor = vscode.TextEditor;

function intersection<E>(setA: Set<E>, setB: Set<E>): Set<E> {
    var _intersection = new Set<E>();
    for (var elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}

function sortByProperty(a: any, b: any, property: string): number {
    const aValue = a[property];
    const bValue = b[property];
    if (aValue > bValue) {
        return 1;
    } else if (aValue < bValue) {
        return -1;
    } else {
        return 0;
    }
}

function sortByProperties(arrayToSort: any[], selectedProperties: string[]): boolean {
    let sortIsDeterminstic = true;
    arrayToSort.sort((a, b) => {
        for (const selectedProperty of selectedProperties) {
            const order = sortByProperty(a, b, selectedProperty);
            if (order !== 0) {
                return order;
            }
        }
        sortIsDeterminstic = false;
        return 0;
    });

    return sortIsDeterminstic;
}

function pickPropertiesIfNecessary(window: typeof Window, selectedProperties: string[], quickPickItems: QuickPickItem[]): Thenable<vscode.QuickPickItem | undefined> {
    const remainingQuickPickItems = quickPickItems.filter(item => selectedProperties.indexOf(item.label) === -1);
    // Don't show picker if only one item is remaining.
    if (remainingQuickPickItems.length > 1) {
        return window.showQuickPick(remainingQuickPickItems, {
            canPickMany: false,
            placeHolder: selectedProperties.length === 0 ? 'Pick property from list to define sort order.' : 'Sorting cannot produce determinable result. Please pick another property.'
        });
    } else {
        return Promise.resolve(remainingQuickPickItems[0]);
    }
}

function pickUntilSortIsDeterministic<E>(window: typeof Window, selectedProperties: string[], quickPickItems: QuickPickItem[], arrayToSort: E[]): Promise<E[]> {
    return new Promise((resolve) => {
        pickPropertiesIfNecessary(window, selectedProperties, quickPickItems)
            .then(selectedItem => {
                if (selectedItem) {
                    const selectedProperty = selectedItem.label;
                    selectedProperties.push(selectedProperty);

                    let sortIsDeterminstic = sortByProperties(arrayToSort, selectedProperties);

                    // The sort is deterministic or the array cannot be sorted in a determinable way.
                    if (sortIsDeterminstic || selectedProperties.length === quickPickItems.length) {
                        resolve(arrayToSort);
                    } else {
                        pickUntilSortIsDeterministic(window, selectedProperties, quickPickItems, arrayToSort)
                            .then(arrayToSort => resolve(arrayToSort));
                    }
                }
            });
    });

}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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
                        .map(o => new Set(Object.getOwnPropertyNames(o)))
                        // Intersection is associative
                        .reduce((a, b) => intersection(a, b));
                    const quickPickItems = Array.from(commonProperties)
                        .map(property => ({
                            label: property
                        } as QuickPickItem));
                    if (quickPickItems.length === 0) {
                        window.showErrorMessage(`There are no properties all objects of this array have in common.`);
                    } else {
                        pickUntilSortIsDeterministic(window, [], quickPickItems, parsedArray.slice(0))
                            .then(sortedArray => {
                                editor.edit(edit => {
                                    edit.replace(selection, JSON.stringify(sortedArray, null, editor.options.tabSize));
                                });
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