'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import TextEditor = vscode.TextEditor;
import { ArrayType, determineArrayType } from './determineArrayType';
import { sortObjectArray } from './sort/sortObjectArray';
import { SortOrder } from './sort/SortOrder';
import { genericSortFn } from './sort/genericSortFn';

function intersection<E>(setA: Set<E>, setB: Set<E>): Set<E> {
    var _intersection = new Set<E>();
    for (var elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
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

function pickUntilSortIsDeterministic<E>(window: typeof Window, selectedProperties: string[], quickPickItems: QuickPickItem[], arrayToSort: E[], sortOrder: SortOrder): Promise<E[]> {
    return new Promise((resolve) => {
        pickPropertiesIfNecessary(window, selectedProperties, quickPickItems)
            .then(selectedItem => {
                // undefined if user uses ESC
                if (selectedItem) {
                    const selectedProperty = selectedItem.label;
                    selectedProperties.push(selectedProperty);

                    let sortIsDeterminstic = sortObjectArray(arrayToSort, selectedProperties, sortOrder);

                    // The sort is deterministic or the array cannot be sorted in a determinable way.
                    if (sortIsDeterminstic || selectedProperties.length === quickPickItems.length) {
                        resolve(arrayToSort);
                    } else {
                        pickUntilSortIsDeterministic(window, selectedProperties, quickPickItems, arrayToSort, sortOrder)
                            .then(arrayToSort => resolve(arrayToSort));
                    }
                }
            });
    });

}

function sortComplexObjectArray(window: typeof Window, array: any[], sortOrder: SortOrder): Promise<any[]> {

    return new Promise((resolve, reject) => {
        const commonProperties = array
            .map(o => new Set(Object.getOwnPropertyNames(o)))
            // Intersection is associative
            .reduce((a, b) => intersection(a, b));
        const quickPickItems = Array.from(commonProperties)
            .map(property => ({
                label: property
            } as QuickPickItem));
        if (quickPickItems.length === 0) {
            reject(`There are no properties all objects of this array have in common.`);
        } else {
            pickUntilSortIsDeterministic(window, [], quickPickItems, array.slice(0), sortOrder)
                .then(resolve);
        }
    });
}


function sortNumberOrStringArray2(window: typeof Window, array: any[], arrayType: ArrayType, sortOrder: SortOrder): Promise<any[]> {
    return new Promise((resolve, reject) => {       
       resolve(array.sort(genericSortFn(arrayType, sortOrder)))
    });
}

function sortArray(window: typeof Window, array: any[], sortOrder: SortOrder): Promise<any[]> {
    const arrayType = determineArrayType(array);
    switch (arrayType) {
        case ArrayType.object:
            return sortComplexObjectArray(window, array, sortOrder);
        case ArrayType.number:
        case ArrayType.string:
            return sortNumberOrStringArray2(window, array, arrayType, sortOrder);
        default:
            return Promise.reject(`This array is not yet supported.`);
    }
}



function sort(sortOrder: SortOrder) {
    return () => {
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
                        sortArray(window, parsedArray, sortOrder)
                            .then(sortedArray => {
                                editor.edit(edit => {
                                    edit.replace(selection, JSON.stringify(sortedArray, null, editor.options.tabSize));
                                })
                            })
                            .catch(error => {
                                window.showErrorMessage(error)
                            })
                    } else {
                        window.showErrorMessage(`Selection is a ${parsedJson.constructor} not an array.`);
                    }
    
                } catch (error) {
                    window.showErrorMessage('Cannot parse selection as JSON.');
                }
            }
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