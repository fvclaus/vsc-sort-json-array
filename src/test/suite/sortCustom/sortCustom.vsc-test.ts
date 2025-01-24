import * as vscode from 'vscode';

import {triggerSortJsonExpectSuccess} from '../triggerSortExpectSuccess';

import {afterEach, after, before, beforeEach} from 'mocha';


import chai = require('chai');
const expect = chai.expect;

import * as temp from 'temp';
import * as fs from 'fs';
import * as path from 'path';
import nextTick from '../nextTick';
import {getGlobalStoragePath} from './getGlobalStoragePath';
import {replaceTextInCurrentEditor, closeActiveEditor} from '../textEditorUtils';
import {rm, mvDir, createSourceModulePath} from './storagePathFsUtils';
import {sleep} from '../sleep';
import { selectQuickOpenItem } from './selectQuickOpenItem';


const B2 = {
  'model': '80 B2',
  'productionStart': 1978,
  'maxPs': 136,
};
const C2 = {
  'model': '100 C2',
  'productionStart': 1976,
  'maxPs': 170,
};
const A4 = {
  'model': 'A4 B6',
  'productionStart': 2000,
  'maxPs': 344,
};
const Q5 = {
  'model': 'Q5 8R',
  'productionStart': 2008,
  'maxPs': 270,
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

async function moveExistingSortModulesBack(tempDir: string, globalStoragePath: string): Promise<void> {
  await rm(globalStoragePath);
  await mvDir(tempDir, globalStoragePath);
}


suite('Sort custom', function() {
  let globalStoragePath: string;
  let tempDir: string;
  let testModulePath!: string;
  let testModuleName!: string;

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
    fs.readdirSync(globalStoragePath).forEach((moduleName) => {
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

  function createTestModule(): void {
    fs.writeFileSync(testModulePath, fs.readFileSync(createSourceModulePath('sortModule')), {flag: 'w'});
    expect(fs.existsSync(testModulePath)).to.be.true;
  }


  test('should sort using custom function', async function() {
    createTestModule();
    await triggerSortJsonExpectSuccess('extension.sortJsonArrayCustom', [A4, B2, C2, Q5], [C2, B2, A4, Q5], async function operateQuickOpen() {
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
      // Wait for text editor to become availble through vscode.window.activeTextEditor
      await nextTick();
      // Wait for new sort module to become open
      await replaceTextInCurrentEditor(sortByDecadeAndPs);
      await vscode.commands.executeCommand('workbench.action.files.save');
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      // Wait until array is sorted.
      await sleep(1000);
    });
  });

  async function setupCommandTest(): Promise<void> {
    createTestModule();
    const document = await vscode.workspace.openTextDocument({
      language: 'JSON',
      content: '[1, 2, 3, 4]',
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand('editor.action.selectAll');
    // Must not await, because this will only resolve once the user navigated 
    // through all menus and the sort is finished.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    vscode.commands.executeCommand('extension.sortJsonArrayCustom');
    // Wait for quick open
    await nextTick();
  }

  test('should rename module', async function() {
    await setupCommandTest();
    await selectQuickOpenItem(testModuleName);
    await selectQuickOpenItem('rename');
    // Rename module
    await selectQuickOpenItem('sort.cars.ts');
    expect(fs.existsSync(testModulePath)).to.be.false;
    expect(fs.existsSync(path.join(globalStoragePath, 'sort.cars.ts'))).to.be.true;
  });

  test('should delete module', async function() {
    await setupCommandTest();
    await selectQuickOpenItem(testModuleName);
    await selectQuickOpenItem('delete');
    await nextTick();
    expect(fs.existsSync(testModulePath)).to.be.false;
  });
});
