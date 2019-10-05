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
import * as fs from 'fs';
import * as glob from 'glob';
import { validateSortModule } from './sortCustom/validateSortModule';
import { loadSortFn } from './sortCustom/loadSortFn';

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

function trySortModule(path: string, array: any[]) {
    return new Promise((resolve, reject) => {
        const fail = (errors: string[]) => {
            errors.forEach(vscode.window.showErrorMessage);
            reject(errors);
        }
        const errors = validateSortModule(path);
        if (errors.length === 0) {
            vscode.window.showInformationMessage('Sort module is valid.');
            const sortFn = loadSortFn(path);
            const arrayCopy = array.slice();
            try {
                arrayCopy.sort(sortFn);
                resolve(arrayCopy);
            } catch (e) {
                fail([`Error while sorting array: ${e}`]);
            }
        } else {
            fail(errors);
        }
    })
}

async function customSort(path: string, array: any[], extensionContext: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): Promise<any> {
    return new Promise(async (resolve, reject) => {
        fs.openSync(path, 'a+');
        const document = await vscode.workspace.openTextDocument(path);
        const editor = await vscode.window.showTextDocument(document);

        const onSave = vscode.workspace.onDidSaveTextDocument(e => {
            if (e.fileName === path) {
                trySortModule(path, array)
                    .then(sortedArray => {
                        outputChannel.clear();
                        outputChannel.appendLine('Sort preview:');
                        outputChannel.appendLine(JSON.stringify(sortedArray, null, 2));
                        outputChannel.show(true);
                    })
                    .catch(e => { });
            }
        });

        const onClose = vscode.window.onDidChangeVisibleTextEditors(e => {
            const sortModuleEditors = e.filter(textEditor => textEditor.document.fileName === path);
            if (sortModuleEditors.length === 0) {
                onSave.dispose();
                onClose.dispose();
                trySortModule(path, array)
                    .then(resolve)
                    .catch(reject);

            }
        });
        /* const result = await vscode.window.showInputBox({
            prompt: 'This is the prompt'
        }) */
    })

}

function generateNewFilename(globalStoragePath: string) {
    const sortModules = glob.sync(`sort.*.ts`, {
        cwd: globalStoragePath
    })
        .map(module => parseInt((module.match(/sort\.(\d+)\.ts/) as any[])[1]))
    sortModules.sort((a, b) => b - a);
    sortModules.push(0);
    return `sort.${sortModules[0] + 1}.ts`
}


function customSortWrapper(extensionContext: vscode.ExtensionContext): () => Promise<any> {
    if (!fs.existsSync(extensionContext.globalStoragePath)) {
        fs.mkdirSync(extensionContext.globalStoragePath);
    }
    const outputChannel = vscode.window.createOutputChannel('Sort preview');



    return () => new Promise((resolve, reject) => {
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
                    const sortModules: vscode.QuickPickItem[] = glob.sync('*.ts', {
                        cwd: extensionContext.globalStoragePath
                    }).map(module => {
                        return {
                            label: module,
                            detail: fs.readFileSync(`${extensionContext.globalStoragePath}/${module}`).toString()
                        }
                    });
                    if (sortModules.length > 0) {

                        vscode.window.showQuickPick([...sortModules, {label: 'New sort module'}])
                            .then(module => {
                                if (module) {
                                    let path: string;
                                    if (module.label === 'New sort module') {
                                        path = generateNewFilename(extensionContext.globalStoragePath);
                                    } else {
                                        path = module.label;
                                    }
                                    customSort(`${extensionContext.globalStoragePath}/${path}`, parsedArray, extensionContext, outputChannel)
                                        .then(sortedArray => {
                                            const workspaceEdit = new vscode.WorkspaceEdit();
                                            workspaceEdit.replace(editor.document.uri, selection, JSON.stringify(sortedArray, null, editor.options.tabSize))
                                            vscode.workspace.applyEdit(workspaceEdit);
                                        })
                                        .catch(error => {
                                            fail(error)
                                        })
                                }
                            });
                    }
                } else {
                    fail(`Selection is a ${parsedJson.constructor} not an array.`);
                }

            } catch (error) {
                fail('Cannot parse selection as JSON.');
            }
        }
    });
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const ascendingSort = vscode.commands.registerCommand('extension.sortJsonArray', sort(SortOrder.ascending));
    const descendingSort = vscode.commands.registerCommand('extension.sortJsonArrayDescending', sort(SortOrder.descending));
    const customSort = vscode.commands.registerCommand('extension.sortJsonArrayCustom', customSortWrapper(context));

    context.subscriptions.push(ascendingSort);
    context.subscriptions.push(descendingSort);
}

// this method is called when your extension is deactivated
export function deactivate() {
}