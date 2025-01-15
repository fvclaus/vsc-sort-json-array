import processAndParseArray from '../../processAndParseArray';
import chai = require('chai');
import {FileExtension} from '../../fileExtension';

const expect = chai.expect;

// TODO Rename. 2 files are named parseArray.
suite('parseArray', function() {
  ([
    ['[1, 2, 3]', FileExtension.JSON, [1, 2, 3]],
    ['[{"id":1}, {"id":2}]', FileExtension.JSON, [{id: 1}, {id: 2}]],
    ['\n{"id":1}\n{"id":2}\n', FileExtension.JSONL, [{id: 1}, {id: 2}]],
  ] as [string, FileExtension, unknown[]][]).forEach(([json, fileExtension, expectedArray]) => {
    test(`should parse valid json ${json}`, function() {
      const [array, _] = processAndParseArray(json, fileExtension);
      expect(array).to.deep.equal(expectedArray);
    });
  });

  test('should throw for invalid json', function(done) {
    try {
      processAndParseArray('["1, 2, 3]', FileExtension.JSON);
    } catch (e) {
      expect((e as Error).message).to.satisfy((msg: string) => msg.startsWith('Cannot parse selection as JSON array.'));
      done();
    }
  });
});
