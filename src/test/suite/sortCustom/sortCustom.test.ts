import * as vscode from 'vscode';

import { triggerSortCommandExpectSuccess } from '../triggerSortCommandExpectSucccess';

import { afterEach, after, before } from 'mocha';


import chai = require('chai');
const expect = chai.expect;

import * as temp from 'temp';
import * as fs from 'fs';
import * as path from 'path';
import nextTick from '../nextTick';
import { getGlobalStoragePath } from './getGlobalStoragePath';
import { replaceTextInCurrentEditor, closeActiveEditor } from '../textEditorUtils';
import { rm, mvDir, createSourceModulePath } from './storagePathFsUtils';


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
    const testModuleName = `sort.test-${new Date().getTime()}.ts`;
    let testModulePath: string;

    before(async () => {
        globalStoragePath = await getGlobalStoragePath();
        tempDir = await moveExistingSortModules(globalStoragePath);
        testModulePath = path.join(globalStoragePath, testModuleName);
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
        console.log("afterEach start");
        fs.readdirSync(globalStoragePath).forEach(moduleName => {
            console.log(`Deleting ${moduleName}`);
            const modulePath = path.join(globalStoragePath, moduleName);
            try {
                fs.unlinkSync(modulePath);
            } catch (e) {
                console.log(`Error while removing test module ${modulePath}: ${e}`);
            }
        });
        console.log("afterEach end globalStoragePath ", fs.readdirSync(globalStoragePath).join(","));
        await closeActiveEditor();
    });

    function createTestModule() {
        fs.writeFileSync(testModulePath!, fs.readFileSync(createSourceModulePath('sortModule')), { flag: 'w' });
        expect(fs.existsSync(testModulePath!)).to.be.true;
    }


    test('should sort using custom function', async () => {
        await triggerSortCommandExpectSuccess('extension.sortJsonArrayCustom', [A4, B2, C2, Q5], [C2, B2, A4, Q5], async function operateQuickOpen() {
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
            await vscode.commands.executeCommand('workbench.action.files.save');
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            await nextTick();
            console.log("globalStoragePath end custom function", fs.readdirSync(globalStoragePath).join(","));
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
        console.log("globalStoragePath ", fs.readdirSync(globalStoragePath).join(","));
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