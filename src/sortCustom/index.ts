import { validateSortModule } from './validateSortModule';
import { loadSortFn } from './loadSortFn';
import * as vscode from 'vscode';
import * as glob from 'glob';
import * as fs from 'fs';
import { generateUniqueSortModuleName } from './generateUniqueSortModuleName';


function trySortModule(window: typeof vscode.window, path: string, array: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const fail = (errors: string[]) => {
            errors.forEach(window.showErrorMessage);
            reject(errors);
        };
        const errors = validateSortModule(path);
        if (errors.length === 0) {
            window.showInformationMessage('Sort module is valid.');
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
    });
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
        let module: string = moduleChoice.label;
        let actionChoice: string | undefined;
        if (module === 'New sort module') {
            module = generateUniqueSortModuleName(extensionContext.globalStoragePath);
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
        const path = `${extensionContext.globalStoragePath}/${module}`;
        switch (actionChoice) {
            case 'edit':
                fs.openSync(path, 'a+');
                const document = await workspace.openTextDocument(path);
                await window.showTextDocument(document);
                const onSave = workspace.onDidSaveTextDocument(e => {
                    if (e.fileName === path) {
                        trySortModule(window, path, array)
                            .then(sortedArray => {
                                outputChannel.clear();
                                outputChannel.appendLine('Sort preview:');
                                outputChannel.appendLine(JSON.stringify(sortedArray, null, 2));
                                outputChannel.show(true);
                            })
                            .catch(e => { });
                    }
                });
                const onClose = window.onDidChangeVisibleTextEditors(e => {
                    const sortModuleEditors = e.filter(textEditor => textEditor.document.fileName === path);
                    if (sortModuleEditors.length === 0) {
                        onSave.dispose();
                        onClose.dispose();
                        trySortModule(window, path, array)
                            .then(resolve)
                            .catch(reject);
                    }
                });
                break;
            case 'apply':
                trySortModule(window, path, array)
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
                        window.showInformationMessage(`Renamed module ${moduleChoice.label} to ${newModuleName}.`);
                    } catch (e) {
                        window.showErrorMessage(`Cannot rename module ${moduleChoice.label}: ${e}`);
                    }
                    return pickModuleAndAction(extensionContext, outputChannel, window, workspace, array);

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
                return pickModuleAndAction(extensionContext, outputChannel, window, workspace, array);
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
