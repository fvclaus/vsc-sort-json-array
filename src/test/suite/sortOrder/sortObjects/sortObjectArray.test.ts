
import {SortOrder} from '../../../../sortOrder/SortOrder';
import {ALL, JOHN, ROBERT, JOHN_PAUL, JIMMY} from './lz';
import chai = require('chai');
import {sortObjectArray} from '../../../../sortOrder/sortObjects/sortObjectArray';
import {SortConfiguration} from '../../../../sortOrder';
const expect = chai.expect;

const SORT_CONFIG_ASCENDING: SortConfiguration = {order: SortOrder.ascending, collator: new Intl.Collator()};
const SORT_ORDER_DESCENDING: SortConfiguration = {order: SortOrder.descending, collator: new Intl.Collator()};

suite('Sort object array', function() {
  test('should return undeterminstic sort order', function() {
    expect(sortObjectArray(ALL, ['name'], SORT_CONFIG_ASCENDING)).to.be.false;
  });

  test('should sort object in ascending order', function() {
    const array = ALL.slice();
    expect(sortObjectArray(array, ['age'], SORT_CONFIG_ASCENDING)).to.be.true;
    expect(array).to.deep.equal([JOHN, ROBERT, JOHN_PAUL, JIMMY]);
  });

  test('should sort object in descending order', function() {
    const array = ALL.slice();
    expect(sortObjectArray(array, ['age'], SORT_ORDER_DESCENDING)).to.be.true;
    expect(array).to.deep.equal([JIMMY, JOHN_PAUL, ROBERT, JOHN]);
  });

  test('should sort with two properties', function() {
    const array = ALL.slice();
    expect(sortObjectArray(array, ['name', 'instrument'], SORT_CONFIG_ASCENDING)).to.be.true;
    expect(array).to.deep.equal([JIMMY, JOHN_PAUL, JOHN, ROBERT]);
  });
});


