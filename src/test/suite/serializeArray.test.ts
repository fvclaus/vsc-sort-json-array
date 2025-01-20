import chai = require('chai');
import serializeArray from '../../serializeArray';
import {FileExtension} from '../../fileExtension';

const expect = chai.expect;

suite('serializeArray', function() {
  ([
    [[1, 2, 3], FileExtension.JSON, '[1,2,3]'],
    [[{id: 1}, {id: 2}], FileExtension.JSON, '[{"id":1},{"id":2}]'],
    [[{id: 1}, {id: 2}], FileExtension.JSONL, '{"id":1}\n{"id":2}'],
  ] as [unknown[], FileExtension, string][]).forEach(([array, fileExtension, expectedArray]) => {
    test(`should serialize array ${expectedArray}`, function() {
      // TODO
      // const serializedArray = serializeArray(array, fileExtension);
      // expect(serializedArray).to.deep.equal(expectedArray);
    });
  });
});
