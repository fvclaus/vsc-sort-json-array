import * as vscode from 'vscode';

import { triggerSortCommandExpectSuccess } from '../triggerSortCommandExpectSucccess';

import { afterEach, after, before, beforeEach } from 'mocha';


import chai = require('chai');
const expect = chai.expect;

import * as temp from 'temp';
import * as fs from 'fs';
import * as path from 'path';
import nextTick from '../nextTick';
import { getGlobalStoragePath } from './getGlobalStoragePath';
import { replaceTextInCurrentEditor, closeActiveEditor } from '../textEditorUtils';
import { rm, mvDir, createSourceModulePath } from './storagePathFsUtils';
import * as os from 'os';
import { sleep } from '../sleep';


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


async function moveExistingSortModules(globalStoragePath: string): Promise<string> {
    const tempDir = temp.mkdirSync();
    // tempDir must not exists, otherwise mv() will try to open() it.
    fs.rmdirSync(tempDir);
    if (!fs.existsSync(globalStoragePath)) {
        fs.mkdirSync(globalStoragePath);
    }
    await mvDir(globalStoragePath, tempDir);
    if (!fs.existsSync(globalStoragePath)) {
        fs.mkdirSync(globalStoragePath);
    }
    return tempDir;
}

async function moveExistingSortModulesBack(tempDir: string, globalStoragePath: string) {
    await rm(globalStoragePath);
    await mvDir(tempDir, globalStoragePath);
}



async function selectQuickOpenItem(item: string) {
    await vscode.commands.executeCommand('workbench.action.focusQuickOpen');
    await vscode.env.clipboard.writeText(item);
    await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
    await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
    await nextTick();
}

suite('Sort custom', () => {

    let globalStoragePath: string;
    let tempDir: string;
    let testModulePath: string;
    let testModuleName: string;
    
    before(async () => {
        globalStoragePath = await getGlobalStoragePath();
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
    
    beforeEach(() => {
        testModuleName = `sort.test-${new Date().getTime()}.ts`;
        testModulePath = path.join(globalStoragePath, testModuleName);
    });


    afterEach(async () => {
        fs.readdirSync(globalStoragePath).forEach(moduleName => {
            const modulePath = path.join(globalStoragePath, moduleName);
            try {
                fs.accessSync(modulePath, fs.constants.W_OK);
                fs.unlinkSync(modulePath);
            } catch (e) {
                console.log(`Error while removing test module ${modulePath}: ${e}`);
            }
        });
        await closeActiveEditor();
    });

    function createTestModule() {
        fs.writeFileSync(testModulePath!, fs.readFileSync(createSourceModulePath('sortModule')), { flag: 'w' });
        expect(fs.existsSync(testModulePath!)).to.be.true;
    }


    test('should sort using custom function', async () => {
        createTestModule();
        await triggerSortCommandExpectSuccess('extension.sortJsonArrayCustom', [A4, B2, C2, Q5], [C2, B2, A4, Q5], async function operateQuickOpen() {
            await selectQuickOpenItem(testModuleName);
            await selectQuickOpenItem('edit');
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
            await replaceTextInCurrentEditor(sortByDecadeAndPs);
            await nextTick();
            await vscode.commands.executeCommand('workbench.action.files.save');
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            // Wait until array is sorted.
            await sleep(1000);
        });
    });

    async function setupCommandTest() {
        createTestModule();
        const document = await vscode.workspace.openTextDocument({
            language: 'JSON',
            content: '[1, 2, 3, 4]'
        });
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('selectAll');
        vscode.commands.executeCommand('extension.sortJsonArrayCustom');
        // Wait for quick open
        await nextTick();
    }

    test('should rename module', async () => {
        await setupCommandTest();
        await selectQuickOpenItem(testModuleName!);
        await selectQuickOpenItem('rename');
        // Rename module
        await selectQuickOpenItem('sort.cars.ts');
        expect(fs.existsSync(testModulePath!)).to.be.false;
        expect(fs.existsSync(path.join(globalStoragePath!, 'sort.cars.ts'))).to.be.true;
    });

    test('should delete module', async () => {
        await setupCommandTest();
        await selectQuickOpenItem(testModuleName);
        await selectQuickOpenItem('delete');
        await nextTick();
        expect(fs.existsSync(testModulePath!)).to.be.false;
    });


});