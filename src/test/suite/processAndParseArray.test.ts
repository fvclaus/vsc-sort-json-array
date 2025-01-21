import processAndParseArray from '../../processAndParseArray';
import chai = require('chai');
import {FileExtension} from '../../fileExtension';
import { convertToLiteralValues } from '../../parser/parseArray';
import {suite, test} from 'mocha';

const expect = chai.expect;

suite('processAndParseArray', function() {
  ([
    ['[1, 2, 3]', FileExtension.OTHER, [1, 2, 3]],
    ['[{"id":1}, {"id":2}]', FileExtension.OTHER, [{id: 1}, {id: 2}]],
    ['\n{"id":1}\n{"id":2}\n', FileExtension.JSONL, [{id: 1}, {id: 2}]],
  ] as [string, FileExtension, unknown[]][]).forEach(([json, fileExtension, expectedArray]) => {
    test(`should parse valid json ${json}`, function() {
      const array = processAndParseArray(json, fileExtension);
      const convertedArray = convertToLiteralValues(array);
      expect(convertedArray).to.deep.equal(expectedArray);
    });
  });

  test('should throw for invalid json', function(done) {
    try {
      processAndParseArray('["1, 2, 3]', FileExtension.OTHER);
    } catch (e) {
      expect((e as Error).message).to.satisfy((msg: string) => msg.startsWith('Cannot parse selection as JSON array.'));
      done();
    }
  });
});
