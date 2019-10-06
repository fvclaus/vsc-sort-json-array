import * as vscode from 'vscode'

import { triggerSortCommandExpectSuccess } from '../triggerSortCommandExpectSucccess';

import { afterEach, beforeEach } from 'mocha';
import { sleep } from '../sleep';

import { ExtensionApi } from '../../../extension';

import * as temp from 'temp';
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import * as mvFile from 'mv';


const B2 = {
    'model': '80 B2',
    'productionStart': 1978,
    'maxPs': 136
},
C2 = {
    'model': '100 C2',
    'productionStart': 1976,
    'maxPs': 170
},
A4 = {
    'model': 'A4 B6',
    'productionStart': 2000,
    'maxPs': 344
},
Q5 = {
    'model': 'Q5 8R',
    'productionStart': 2008,
    'maxPs': 270
};

interface CarSpec {
    model: string;
    productionStart: number;
    maxPs: number;
}

function calculateDecade(carSpec: CarSpec) {
    return Math.floor(carSpec.productionStart / 10) * 10
}

function sort(a: CarSpec, b: CarSpec): number {
    const decadeDifference = calculateDecade(a) - calculateDecade(b);
    if (decadeDifference == 0) {
        return a.maxPs - b.maxPs;
    } else {
        return decadeDifference;
    }
}

function writeCurrentDocument(content: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const activeEditor = (vscode.window.activeTextEditor as vscode.TextEditor);
        activeEditor.edit(edit => {
            const all = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(activeEditor.document.lineCount, 0));
            edit.replace(all, content);
            resolve(true);
        });
    })
}

function mvDir(from: string, to: string) {
    const matches = glob.sync('*', {
        cwd: from
    });
    matches.forEach(match => {
        mvFile(path.join(from, match), path.join(to, match), console.error);
    });
}

function moveExistingSortModules(globalStoragePath: string) {
    const tempDir = temp.mkdirSync();
    console.log(`Moving from ${globalStoragePath} to ${tempDir}`)
    mvDir(globalStoragePath, tempDir);
}

function moveExistingSortModulesBack(tempDir: string, globalStoragePath: string) {
    mvDir(tempDir, globalStoragePath);
    fs.unlinkSync(tempDir);
}

async function loadExtension(extensionId: string) {
    try {
        await vscode.commands.executeCommand('extension.sortJsonArrayCustom');
    } catch (e) {

    }
}

suite('Sort objects', () => {

    let globalStoragePath: string | undefined;
    let tempDir: string | undefined;

    afterEach(async () => {
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        if (globalStoragePath && tempDir) {
            try {
                await moveExistingSortModulesBack(tempDir, globalStoragePath);
            } catch (e) {
                console.error(`Error while moving sort modules back: ${e}`);
            }
        }
    });

    test('should sort using name and age', async () => {
        const commands = await vscode.commands.getCommands();
        const extensionId = 'fvclaus.sort-json-array';
        await loadExtension(extensionId);
        const extensionApi: ExtensionApi = vscode.extensions.getExtension(extensionId)!.exports;
        const globalStoragePath = extensionApi.getGlobalStoragePath();
        moveExistingSortModules(globalStoragePath);
        await triggerSortCommandExpectSuccess('extension.sortJsonArrayCustom', [A4, B2, C2, Q5], [C2, B2, A4, Q5], async function operateQuickOpen() {
            // Must wait for extension to become active.
            /* await sleep(1000); */
            await sleep(1000);
            const sortByDecadeAndPs = `
            interface CarSpec {
                model: string;
                productionStart: number;
                maxPs: number;
            }
            
            function calculateDecade(carSpec: CarSpec) {
                return Math.floor(carSpec.productionStart / 10) * 10
            }
            
            /**
             * Sort ascending decade and descending ps
             */
            export function sort(a: CarSpec, b: CarSpec): number {
                const decadeDifference = calculateDecade(a) - calculateDecade(b);
                if (decadeDifference == 0) {
                    return b.maxPs - a.maxPs;
                } else {
                    return decadeDifference;
                }
            }`;
            // Wait for new sort module to become open
            await sleep(500);
            writeCurrentDocument(sortByDecadeAndPs);
            await sleep(100);
            await vscode.commands.executeCommand('workbench.action.files.save');
            await sleep(100);
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            await sleep(100);
            /* await vscode.commands.executeCommand('workbench.action.focusQuickOpen');
            await sleep(2000);
            await vscode.env.clipboard.writeText('age');
            await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
            await sleep(10000);
            await vscode.commands.executeCommand('workbench.action.quickOpenSelectNext');
            await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
            await sleep(500);
            return vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem'); */
        });
    });

    /* test('should show no common properties error message', async () => {
        triggerSortCommandExpectFailure(JSON.stringify([{ 'foo': 1 }, { 'bar': 2 }], null, 2), `There are no properties all objects of this array have in common.`);
    }); */

});