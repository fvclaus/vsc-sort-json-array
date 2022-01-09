
import chai = require('chai');
import {genericSortFn} from '../../../../sortOrder/sortNumberOrStrings/genericSortFn';
import {SortOrder} from '../../../../sortOrder/SortOrder';
const expect = chai.expect;

suite('Determine array type', function() {
  const ASCENDING_ARRAYS = [
    [['foo', 'bar', 'car'], ['bar', 'car', 'foo']],
    [[100, 1, 99], [1, 99, 100]],

  ];

  ASCENDING_ARRAYS.forEach(([array, expectedArray]) => {
    test(`should sort array ${JSON.stringify(array)}`, function() {
      array.sort(genericSortFn({order: SortOrder.ascending, collator: new Intl.Collator()}));
      expect(array).to.deep.equal(expectedArray);
    });
  });
});
