import {validateSortModule} from './validateSortModule';
import {loadSortFn} from './loadSortFn';
import * as vscode from 'vscode';
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import {createNewSortModule} from './generateUniqueSortModuleName';
import { ArrayItems } from '../parser/parseArray';
import { showQuickPick } from '../showQuickPick';


class SortError extends Error {
  constructor(public errors: string[]) {
    super();
  }
}

function trySortModule(window: typeof vscode.window, path: string, moduleName: string, array: ArrayItems): Promise<ArrayItems> {
  // Must wrap in Promise to receive errors. Thenable has no .catch
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    window.withProgress<void>({
      location: vscode.ProgressLocation.Window,
      title: `Validating and applying sort module ${moduleName}`,
    }, () => { // Window does not support progress.
      const rejectWithErrors = (errors: string[]): Promise<void> => {
        const error = new SortError((errors.map((error) => `Module ${moduleName}: ${error}`)));
        reject(error);
        return Promise.reject(error);
      };
      const errors = validateSortModule(path);
      if (errors.length === 0) {
        const sortFn = loadSortFn(path);
        const arrayCopy = array.slice() as ArrayItems;
        try {
          arrayCopy.sort(sortFn);
          resolve(arrayCopy);
          return Promise.resolve();
        } catch (e) {
          return rejectWithErrors([`Error while sorting array: ${e}`]);
        }
      } else {
        return rejectWithErrors(errors);
      }
    });
  });
}

function executeAction({
  actionChoice,
  moduleName,
  modulePath,
  window,
  workspace,
  outputChannel,
  moduleChoice,
  extensionContext,
  array}: {
    actionChoice: string,
    modulePath: string,
    moduleName: string,
    window: typeof vscode.window,
    workspace: typeof vscode.workspace,
    outputChannel: vscode.OutputChannel,
    moduleChoice: vscode.QuickPickItem,
    extensionContext: vscode.ExtensionContext,
     array: ArrayItems}): Promise<ArrayItems | undefined> {
  // Promise is necessary to integrate with .onDidSaveTextDocument callback.
  // It is also more flexible than async
  return new Promise((resolve, reject) => {
    switch (actionChoice) {
      case 'edit': {
        fs.openSync(modulePath, 'a+');
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        workspace.openTextDocument(modulePath)
            .then((document) => window.showTextDocument(document))
            .then(() => {
              const onSave = workspace.onDidSaveTextDocument((e) => {
                if (e.fileName === modulePath) {
                  trySortModule(window, modulePath, moduleName, array)
                      .then((sortedArray) => {
                        outputChannel.clear();
                        outputChannel.appendLine('Sort preview:');
                        outputChannel.appendLine(JSON.stringify(sortedArray, null, 2));
                        outputChannel.show(true);
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        window.showInformationMessage(`Module ${moduleName} is valid`);
                      })
                      .catch((error: SortError) => error.errors.forEach(window.showErrorMessage));
                }
              });
              const onClose = window.onDidChangeVisibleTextEditors(async (e) => {
                const sortModuleEditors = e.filter((textEditor) => textEditor.document.fileName === modulePath);
                if (sortModuleEditors.length === 0) {
                  onSave.dispose();
                  onClose.dispose();
                  trySortModule(window, modulePath, moduleName, array)
                      .then(resolve)
                      .catch(reject);
                }
              });
            });
        break;
      }
      case 'apply':
        trySortModule(window, modulePath, moduleName, array)
            .then(resolve)
            .catch(reject);
        break;
      case 'rename': {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        window.showInputBox({
          prompt: 'New sort module name including .ts',
          value: moduleChoice.label,
          validateInput: (input: string) => {
            if (!input.endsWith('.ts')) {
              return 'Module name must end in .ts';
            }
            return null;
          },
        }).then((newModuleName) => {
          if (newModuleName != null) {
            try {
              fs.renameSync(modulePath, path.join(extensionContext.globalStoragePath, newModuleName));
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              window.showInformationMessage(`Renamed module ${moduleName} to ${newModuleName}.`);
            } catch (e) {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              window.showErrorMessage(`Cannot rename module ${moduleName}: ${e}`);
            }
            pickModuleAndAction(extensionContext, outputChannel, window, workspace, array)
                .then(resolve)
                .catch(reject);
          }
        });
        break;
      }
      case 'delete':
        try {
          fs.unlinkSync(modulePath);
          try {
            // Try to remove transpiled version.
            fs.unlinkSync(modulePath.replace('.ts', '.js'));
          } catch (e) {
            // Ignore errors
          }
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          window.showInformationMessage(`Deleted module ${moduleChoice.label}.`);
        } catch (e) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          window.showErrorMessage(`Cannot delete module ${moduleChoice.label}: ${e}`);
        }
        pickModuleAndAction(extensionContext, outputChannel, window, workspace, array)
            .then(resolve)
            .catch(reject);
        break;
    }
  });
}


async function pickModuleAndAction(
    extensionContext: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel,
    window: typeof vscode.window,
    workspace: typeof vscode.workspace, array: ArrayItems): Promise<ArrayItems | undefined> {
  const sortModules: vscode.QuickPickItem[] = glob.sync('*.ts', {
    cwd: extensionContext.globalStoragePath,
  })
      .map((module) => ({module, modulePath: path.join(extensionContext.globalStoragePath, module)}))
      .filter(({module, modulePath}) => {
        console.log('Module ', module, modulePath);
        try {
          fs.accessSync(modulePath, fs.constants.W_OK);
          return true;
        } catch (e) {
          console.error(`Skipping module ${module}: ${e}`);
          return false;
        }
      })
      .map(({module, modulePath}) => {
        return {
          label: module,
          detail: fs.readFileSync(modulePath).toString(),
        };
      });

  let moduleChoice: vscode.QuickPickItem | undefined;
  if (sortModules.length > 0) {
    // TODO Extract to constant.
    const quickPick = window.createQuickPick();
    quickPick.placeholder = 'Pick a sort module';
    quickPick.items = [...sortModules, {label: 'New sort module'}];
    moduleChoice = await showQuickPick(extensionContext, quickPick);
  } else {
    moduleChoice = {label: 'New sort module'};
  }
  // User escaped quick pick.
  if (moduleChoice == null) {
    return;
  }
  let moduleName: string = moduleChoice.label;
  let actionChoice: vscode.QuickPickItem | undefined;
  if (moduleName === 'New sort module') {
    moduleName = createNewSortModule(extensionContext.globalStoragePath);
    actionChoice = {label: 'edit'};
  } else {
    const quickPick = window.createQuickPick();
    quickPick.placeholder = 'Pick an action';
    quickPick.items = ['apply', 'edit', 'rename', 'delete'].map(a => ({label: a}));
    actionChoice = await showQuickPick(extensionContext, quickPick);
  }
  if (actionChoice == null) {
    return;
  }
  const modulePath = path.join(extensionContext.globalStoragePath, moduleName);
  return executeAction({
    actionChoice: actionChoice.label,
    moduleName,
    modulePath,
    window,
    workspace,
    outputChannel,
    moduleChoice,
    extensionContext,
    array,
  });
}

export function sortCustom(extensionContext: vscode.ExtensionContext,
  window: typeof vscode.window, workspace: typeof vscode.workspace, array: ArrayItems): Promise<ArrayItems | undefined> {
  if (!fs.existsSync(extensionContext.globalStoragePath)) {
    fs.mkdirSync(extensionContext.globalStoragePath);
  }
  const outputChannel = window.createOutputChannel('Sort preview');
  return pickModuleAndAction(extensionContext, outputChannel, window, workspace, array);
}
