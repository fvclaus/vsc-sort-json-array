
import {SortOrder} from '../../../../sortOrder/SortOrder';
import {ALL, JOHN, ROBERT, JOHN_PAUL, JIMMY} from './lz';
import chai = require('chai');
import {sortObjectArray} from '../../../../sortOrder/sortObjects/sortObjectArray';
const expect = chai.expect;

suite('Sort object array', function() {
  test('should return undeterminstic sort order', function() {
    expect(sortObjectArray(ALL, ['name'], SortOrder.ascending)).to.be.false;
  });

  test('should sort object in ascending order', function() {
    const array = ALL.slice();
    expect(sortObjectArray(array, ['age'], SortOrder.ascending)).to.be.true;
    expect(array).to.deep.equal([JOHN, ROBERT, JOHN_PAUL, JIMMY]);
  });

  test('should sort object in descending order', function() {
    const array = ALL.slice();
    expect(sortObjectArray(array, ['age'], SortOrder.descending)).to.be.true;
    expect(array).to.deep.equal([JIMMY, JOHN_PAUL, ROBERT, JOHN]);
  });

  test('should sort with two properties', function() {
    const array = ALL.slice();
    expect(sortObjectArray(array, ['name', 'instrument'], SortOrder.ascending)).to.be.true;
    expect(array).to.deep.equal([JIMMY, JOHN_PAUL, JOHN, ROBERT]);
  });
});


