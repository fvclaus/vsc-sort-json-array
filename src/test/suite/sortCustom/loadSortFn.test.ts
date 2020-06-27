import chai = require('chai');
import {loadSortFn} from '../../../sortCustom/loadSortFn';
import {createSourceModulePath} from './storagePathFsUtils';
const expect = chai.expect;

suite('Load sort fn', function() {
  test('should load sort function from module', function() {
    const sortFn = loadSortFn(createSourceModulePath('sortModule'));
    const result = sortFn.call(null, null, null);
    expect(result).to.equal(-1);
  });
});
