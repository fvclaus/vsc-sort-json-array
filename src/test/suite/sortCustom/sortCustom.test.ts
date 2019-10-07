import * as vscode from 'vscode'

import { triggerSortCommandExpectSuccess } from '../triggerSortCommandExpectSucccess';

import { afterEach, after, before } from 'mocha';
import { sleep } from '../sleep';

import { ExtensionApi } from '../../../extension';

import chai = require('chai');
const expect = chai.expect;

import * as temp from 'temp';
import * as fs from 'fs';
import * as path from 'path';
import * as mvFile from 'mv';
import * as rimraf from 'rimraf';


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

function rm(path: string): Promise<any> {
    
    return new Promise((resolve, reject) => {
        rimraf(path, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

function mvDir(from: string, to: string): Promise<any> {
    return new Promise((resolve, reject) => {
        mvFile(from, to, {mkdirp: true}, error => {
            if (error) {
                reject(error);                
            } else {
                resolve();
            }
        });
    })
}

async function moveExistingSortModules(globalStoragePath: string): Promise<string> {
    const tempDir = temp.mkdirSync();
    // tempDir must not exists, otherwise mv() will try to open() it.
    fs.rmdirSync(tempDir);
    try {
        // Make sure the global storage folder exists.
        fs.mkdirSync(globalStoragePath);
    } catch (e) {

    }
    await mvDir(globalStoragePath, tempDir);
    return tempDir;
}

async function moveExistingSortModulesBack(tempDir: string, globalStoragePath: string) {
    await rm(globalStoragePath);
    await mvDir(tempDir, globalStoragePath);
}

async function activateExtension() {
    try {
        await vscode.commands.executeCommand('extension.sortJsonArrayCustom');
    } catch (e) {

    }
}

async function selectQuickOpenItem(item: string) {
    await vscode.commands.executeCommand('workbench.action.focusQuickOpen');
    await vscode.env.clipboard.writeText(item);
    await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
    await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
}

suite('Sort custom', () => {

    let globalStoragePath: string | undefined;
    let tempDir: string | undefined;

    before(async () => {
        const extensionId = 'fvclaus.sort-json-array';
        await activateExtension();
        const extensionApi: ExtensionApi = vscode.extensions.getExtension(extensionId)!.exports;
        globalStoragePath = extensionApi.getGlobalStoragePath();
        tempDir = await moveExistingSortModules(globalStoragePath);
    });

    after(async () => {
        if (globalStoragePath && tempDir) {
            try {
                await moveExistingSortModulesBack(tempDir, globalStoragePath);
            } catch (e) {
                console.error(`Error while moving sort modules back: ${e}`);
            }
        }
    });


    afterEach(async () => {
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    test('should sort using custom function', async () => {
        await triggerSortCommandExpectSuccess('extension.sortJsonArrayCustom', [A4, B2, C2, Q5], [C2, B2, A4, Q5], async function operateQuickOpen() {
            // Wait for quick open
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
            await writeCurrentDocument(sortByDecadeAndPs);
            await vscode.commands.executeCommand('workbench.action.files.save');
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            await sleep(100);
        });
    });

    test('should rename and apply file', async () => {

        await triggerSortCommandExpectSuccess('extension.sortJsonArrayCustom', [A4, B2, C2, Q5], [C2, B2, A4, Q5], async function operateQuickOpen() {
            // Wait for quick open
            await sleep(1000);
            await selectQuickOpenItem('sort.1.ts');
            await selectQuickOpenItem('rename');
            // Rename module
            await selectQuickOpenItem('sort.cars.ts');
            // Select renamed module
            await selectQuickOpenItem('sort.cars.ts');
            await selectQuickOpenItem('apply');
        });
    });

    test('should delete file', async() => {
        const document = await vscode.workspace.openTextDocument({
            language: 'JSON',
            content: '[1, 2, 3, 4]'
        })
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('selectAll');
        vscode.commands.executeCommand('extension.sortJsonArrayCustom');
        // Wait for quick open
        await sleep(1000);
        await selectQuickOpenItem('sort.cars.ts');
        await selectQuickOpenItem('delete'); 
        await sleep(1000);
        
        expect(fs.existsSync(path.join(globalStoragePath!, 'sort.cars.ts'))).to.be.false
    });


});