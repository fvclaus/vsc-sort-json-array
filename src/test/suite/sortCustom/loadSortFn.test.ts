import chai = require('chai');
import { loadSortFn } from '../../../sortCustom/loadSortFn';
const expect = chai.expect;
import { createSourceModulePath } from './createSourceModulePath';

suite('Load sort fn', () => {

    test('should load sort function from module', () => {
        const sortFn = loadSortFn(createSourceModulePath('sortModule.ts'));
        const result = sortFn.call(null, null, null);
        expect(result).to.equal(-1);
    });

});