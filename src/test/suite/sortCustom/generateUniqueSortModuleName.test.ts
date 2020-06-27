import chai = require('chai');
const expect = chai.expect;
import {afterEach} from 'mocha';
import * as temp from 'temp';
import * as fs from 'fs';
import * as path from 'path';
import {createNewSortModule} from '../../../sortCustom/generateUniqueSortModuleName';
import * as rimraf from 'rimraf';

suite('Generate unique sort module name', function() {
  function generateModuleFiles(modules: string[]): string {
    const storageLocation = temp.mkdirSync();
    modules.forEach((module) => {
      fs.openSync(path.join(storageLocation, module), 'a+');
    });
    return storageLocation;
  }

  let storageLocation: string | undefined;

  afterEach(() => {
    if (storageLocation != null) {
      try {
        rimraf.sync(storageLocation);
      } catch (e) {
        // Ignore errors.
      }
    }
  });

  [
    [['sort.foo.ts', 'sort.bar.ts'], 'sort.1.ts'],
    [['sort.1.ts', 'sort.2.ts'], 'sort.3.ts'],
    [[], 'sort.1.ts'],
  ].forEach(([modules, expectedModuleName]) => {
    test('should ignore other naming conventions', function() {
      storageLocation = generateModuleFiles(modules as string[]);
      const uniqueSortModuleName = createNewSortModule(storageLocation);
      expect(uniqueSortModuleName).to.equal(expectedModuleName);
    });
  });
});
