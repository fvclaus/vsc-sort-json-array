import chai = require('chai');
import serializeArray from '../../serializeArray';
import {FileExtension} from '../../fileExtension';
import {suite, test} from 'mocha';
import processAndParseArray from '../../processAndParseArray';
import { addIndex } from '../../indexArray';

const expect = chai.expect;

suite('serializeArray', function() {
  ([
    [`[1, 2, 3]`, FileExtension.JSON, '[1, 2, 3]'],
    [`[{id: 1}, {id: 2}]`, FileExtension.JSON, '[{id: 1}, {id: 2}]'],
    [`{"id": 1}\n{"id": 2}`, FileExtension.JSONL, '{"id": 1}\n{"id": 2}'],
  ] as [string, FileExtension, string][]).forEach(([text, fileExtension, expectedArray]) => {
    test(`should serialize array ${expectedArray}`, function() {
      const [parsedArray, positions] = processAndParseArray(text, fileExtension);
      const serializedArray = serializeArray(addIndex(parsedArray), fileExtension, text, positions, {indentLevel: 0, newIndent: '\t'} );
      expect(serializedArray).to.deep.equal(expectedArray);
    });
  });
});
