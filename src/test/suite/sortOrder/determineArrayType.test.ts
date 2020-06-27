import {determineArrayType, ArrayType} from '../../../sortOrder/determineArrayType';

import chai = require('chai');
const expect = chai.expect;

suite('Determine array type', function() {
  const UNSUPPORTED_ARRAYS = [
    [],
    [null],
    [1, 'foo'],
    [1, null, 'foo'],
    [{'foo': 'bar'}, 1],

  ];

  UNSUPPORTED_ARRAYS.forEach((unsupportedArray) => {
    test(`should not support array ${JSON.stringify(unsupportedArray)}`, function() {
      expect(determineArrayType(unsupportedArray)).to.be.undefined;
    });
  });

  const SUPPORTED_ARRAYS = [
    [[1], ArrayType.number],
    [[10, 20, 1], ArrayType.number],
    [['foo'], ArrayType.string],
    [['foo', 'bar'], ArrayType.string],
    [[{'age': 10}, {'age': 20}], ArrayType.object],
  ];

  SUPPORTED_ARRAYS.forEach(([supportedArray, expectedType]) => {
    test(`should supported supported ${JSON.stringify(supportedArray)}`, function() {
      expect(determineArrayType(supportedArray as unknown[])).to.equal(expectedType);
    });
  });
});
