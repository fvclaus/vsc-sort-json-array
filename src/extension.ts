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
import * as ts from 'typescript';
import * as temp from 'temp';

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

function createFileIfNotExists(path: string) {
    return new Promise((resolve, reject) => {
        fs.open(path, 'a+', function(err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data);
            }
        })
    })
}


function validateSortFunction(node: ts.FunctionDeclaration): string[] {
    const errors = []
    if (node.parameters.length !== 2) {
        errors.push('Must have exactly two parameters.')
    }
    return errors;
}


function validateTopLevelDeclarations(node: ts.Node): string[] {
    let errors: string[] = [];
    let hasSortFunction = false;
    
    node.forEachChild(node => {
        switch(node.kind) {
            case ts.SyntaxKind.FunctionDeclaration:
                const functionDeclaration = node as ts.FunctionDeclaration;
                const functionName = functionDeclaration.name;
                if (functionName && functionName.escapedText === 'sort') {
                    const sortFunctionErrors = validateSortFunction(functionDeclaration)
                        .map(error => `Sort function is invalid: ${error}`);
                    errors = [...sortFunctionErrors]
                    hasSortFunction = true;
                }
                break;
        }
    });

    if (!hasSortFunction) {
        errors.push('This file must define a sort(a, b) function.')
    }

    return errors;
}

function compileModule(path: string): (a: any, b: any) => number {
    const transpiledModule = ts.transpileModule(fs.readFileSync(path).toString(), {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS
        }
    });
    const tempFile = temp.openSync();
    fs.writeFileSync(tempFile.path, transpiledModule.outputText);
    const sortModule = require(tempFile.path);
    return sortModule.sort;
}

async function customSort(array: any[], extensionContext: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const path = `${extensionContext.globalStoragePath}/sort.ts`;
    
        const foo = await createFileIfNotExists(path);
        const document = await vscode.workspace.openTextDocument(path);
        const editor = await vscode.window.showTextDocument(document);
        vscode.workspace.onDidSaveTextDocument(e => {
            const sourceFile = ts.createSourceFile(path, fs.readFileSync(path).toString(), ts.ScriptTarget.ES2015);
            const errors = validateTopLevelDeclarations(sourceFile);
            if (errors.length === 0) {
                vscode.window.showInformationMessage('Sort module is valid.');
                const sortFn = compileModule(path);
                const arrayCopy = array.slice();                
                try {
                    arrayCopy.sort(sortFn);
                    outputChannel.append(JSON.stringify(arrayCopy, null, 2));
                    outputChannel.show(true);
                } catch (e) {
                    vscode.window.showErrorMessage(`Error while sorting array: ${e}`);
                }
            } else {
                errors.forEach(vscode.window.showErrorMessage);            
            }
        })
        const result = await vscode.window.showInputBox({
            prompt: 'This is the prompt'
        })
    })

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
                    customSort(parsedArray, extensionContext, outputChannel)                    
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