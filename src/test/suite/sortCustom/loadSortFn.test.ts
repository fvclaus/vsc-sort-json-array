import { expect } from 'chai';
import { loadSortFn } from '../../../sortCustom/loadSortFn';
import * as temp from 'temp';
import * as fs from 'fs';
import { createSourceModulePath } from './storagePathFsUtils';

suite('Load sort fn', function() {
  test('should load sort function from module', function() {
    const { sortFn, errors } = loadSortFn(createSourceModulePath('sortModule'));
    expect(errors).to.be.empty;
    expect(sortFn).to.be.a('function');
    const result = sortFn!.call(null, null, null);
    expect(result).to.equal(-1);
  });

  [
    ['noExportKeyword', 'Must use export keyword'],
    ['wrongNumberOfParameters', 'Must have exactly two parameters'],
    ['commonJsExport', 'CommonJS exports are not supported, use ES Module "export" instead'],
  ].forEach(([moduleName, expectedError]) => {

    test(`should detect errors in ${moduleName}`, function() {
      const { errors } = loadSortFn(createSourceModulePath(`sortModule.${moduleName}`));
      expect(errors).to.have.members([`Sort function is invalid: ${expectedError}.`]);
    });
  });

  test('should detect missing sort function', function() {
    const { errors } = loadSortFn(createSourceModulePath(`sortModule.noSortFunction`));
    expect(errors).to.have.members(['Must define a sort(a, b) function.']);
  });

  test('should detect invalid typescript', function() {
    const unclosedQuotationMark = `function sort(a: any, b: any): number {
            const runawayString = 'fo;
            return -1;
        }`;
    const tempPath = temp.openSync();
    fs.writeFileSync(tempPath.path, unclosedQuotationMark);
    const { errors } = loadSortFn(tempPath.path);
    try {
      fs.unlinkSync(tempPath.path);
     
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      // Ignore errors
    }
    // amaro can throw if parsing fails
    expect(errors[0]).to.contain('Unterminated string constant');
  });

  test('should load sort function with enum and parameter properties', function() {
    const code = `
      enum Order {
        Asc = 1,
        Desc = -1
      }
      class Sorter {
        constructor(private order: Order) {}
        sort(a: any, b: any): number {
          return a > b ? this.order : -this.order;
        }
      }
      const s = new Sorter(Order.Asc);
      export const sort = (a: any, b: any) => s.sort(a, b);
    `;
    const tempPath = temp.openSync();
    fs.writeFileSync(tempPath.path, code);
    const { sortFn, errors } = loadSortFn(tempPath.path);
    try {
      fs.unlinkSync(tempPath.path);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      // Ignore
    }
    expect(errors).to.be.empty;
    expect(sortFn).to.be.a('function');
    expect(sortFn!(2, 1)).to.equal(1);
    expect(sortFn!(1, 2)).to.equal(-1);
  });
});
