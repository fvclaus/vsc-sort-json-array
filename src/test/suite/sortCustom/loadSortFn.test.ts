import chai = require('chai');
import { loadSortFn } from '../../../sortCustom/loadSortFn';
const expect = chai.expect;

suite('Load sort fn', () => {

    test('should load sort function from module', () => {
        const sortFn = loadSortFn(`${__dirname}/sortModule.ts`. replace('/out', '/src'));
        const result = sortFn.call(null, null, null);
        expect(result).to.equal(-1);
    });

});