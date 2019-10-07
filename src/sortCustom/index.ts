import { validateSortModule } from './validateSortModule';
import { loadSortFn } from './loadSortFn';
import * as vscode from 'vscode';
import * as glob from 'glob';
import * as fs from 'fs';
import { generateUniqueSortModuleName } from './generateUniqueSortModuleName';


function trySortModule(window: typeof vscode.window, path: string, moduleName: string, array: any[]): Promise<any[]> {
    const sortPromise = new Promise((resolve, reject) => {
        window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: `Validating and applying sort module ${moduleName}`
            // Window does not support progress.
        }, (progress) => {
             const fail = (errors: string[]) => {
                reject(errors.map(error => `Module ${moduleName}: ${error}`));
            };
            const errors = validateSortModule(path);
            if (errors.length === 0) {
                const sortFn = loadSortFn(path);
                const arrayCopy = array.slice();
                try {
                    arrayCopy.sort(sortFn);
                    resolve(arrayCopy);
                }
                catch (e) {
                    fail([`Error while sorting array: ${e}`]);
                }
            }
            else {
                fail(errors);
            }
            return sortPromise;
        })
    });
    return sortPromise as Promise<any>;
}

function pickModuleAndAction(extensionContext: vscode.ExtensionContext, outputChannel: vscode.OutputChannel, window: typeof vscode.window, workspace: typeof vscode.workspace, array: any[]): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
        const sortModules: vscode.QuickPickItem[] = glob.sync('*.ts', {
            cwd: extensionContext.globalStoragePath
        }).map(module => {
            return {
                label: module,
                detail: fs.readFileSync(`${extensionContext.globalStoragePath}/${module}`).toString()
            };
        });
        let moduleChoice: vscode.QuickPickItem | undefined;
        if (sortModules.length > 0) {
            // TODO Extract to constant.
            moduleChoice = await window.showQuickPick([...sortModules, { label: 'New sort module' }], {
                placeHolder: 'Pick a sort module'
            });
        }
        else {
            moduleChoice = { label: 'New sort module' };
        }
        // User escaped quick pick.
        if (!moduleChoice) {
            return;
        }
        let moduleName: string = moduleChoice.label;
        let actionChoice: string | undefined;
        if (moduleName === 'New sort module') {
            moduleName = generateUniqueSortModuleName(extensionContext.globalStoragePath);
            actionChoice = 'edit';
        }
        else {
            actionChoice = await window.showQuickPick(['apply', 'edit', 'rename', 'delete'], {
                placeHolder: 'Pick an action'
            });
        }
        if (!actionChoice) {
            return;
        }
        const path = `${extensionContext.globalStoragePath}/${moduleName}`;
        switch (actionChoice) {
            case 'edit':
                fs.openSync(path, 'a+');
                const document = await workspace.openTextDocument(path);
                await window.showTextDocument(document);
                const onSave = workspace.onDidSaveTextDocument(e => {
                    if (e.fileName === path) {
                        trySortModule(window, path, moduleName, array)
                            .then(sortedArray => {
                                outputChannel.clear();
                                outputChannel.appendLine('Sort preview:');
                                outputChannel.appendLine(JSON.stringify(sortedArray, null, 2));
                                outputChannel.show(true);
                                window.showInformationMessage(`Module ${moduleName} is valid`);
                            })
                            .catch((errors: string[]) => errors.forEach(window.showErrorMessage));
                    }
                });
                const onClose = window.onDidChangeVisibleTextEditors(e => {
                    const sortModuleEditors = e.filter(textEditor => textEditor.document.fileName === path);
                    if (sortModuleEditors.length === 0) {
                        onSave.dispose();
                        onClose.dispose();
                        trySortModule(window, path, moduleName, array)
                            .then(resolve)
                            .catch(reject);
                    }
                });
                break;
            case 'apply':
                trySortModule(window, path, moduleName, array)
                    .then(resolve)
                    .catch(reject);
                break;
            case 'rename':
                const newModuleName = await window.showInputBox({
                    prompt: 'New sort module name including .ts',
                    value: moduleChoice.label,
                    validateInput: (input: string) => {
                        if (!input.endsWith('.ts')) {
                            return 'Module name must end in .ts';
                        }
                        return null;
                    }
                });
                if (newModuleName) {
                    try {
                        fs.renameSync(path, `${extensionContext.globalStoragePath}/${newModuleName}`);
                        window.showInformationMessage(`Renamed module ${moduleName} to ${newModuleName}.`);
                    } catch (e) {
                        window.showErrorMessage(`Cannot rename module ${moduleName}: ${e}`);
                    }
                    pickModuleAndAction(extensionContext, outputChannel, window, workspace, array)
                        .then(resolve)
                        .catch(reject)

                }
                break;
            case 'delete':
                try {
                    fs.unlinkSync(path);
                    try {
                        // Try to remove transpiled version.
                        fs.unlinkSync(path.replace('.ts', '.js'));
                    } catch (e) {
                        // Ignore errors
                    }
                    window.showInformationMessage(`Deleted module ${moduleChoice.label}.`);
                } catch (e) {
                    window.showErrorMessage(`Cannot delete module ${moduleChoice.label}: ${e}`);
                }
                pickModuleAndAction(extensionContext, outputChannel, window, workspace, array)
                    .then(resolve)
                    .catch(reject);
        }
    });
}

export function sortCustom(extensionContext: vscode.ExtensionContext): (window: typeof vscode.window, workspace: typeof vscode.workspace, array: any[]) => Promise<any[]> {
    return (window, workspace, array) => {
        if (!fs.existsSync(extensionContext.globalStoragePath)) {
            fs.mkdirSync(extensionContext.globalStoragePath);
        }
        const outputChannel = window.createOutputChannel('Sort preview');
        return pickModuleAndAction(extensionContext, outputChannel, window, workspace, array);
    }
}
