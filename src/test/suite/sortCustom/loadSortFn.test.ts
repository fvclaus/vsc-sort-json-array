import chai = require('chai');
import { loadSortFn } from '../../../sortCustom/loadSortFn';
import { createSourceModulePath } from './storagePathFsUtils';
const expect = chai.expect;

suite('Load sort fn', () => {

    test('should load sort function from module', () => {
        const sortFn = loadSortFn(createSourceModulePath('sortModule'));
        const result = sortFn.call(null, null, null);
        expect(result).to.equal(-1);
    });

});