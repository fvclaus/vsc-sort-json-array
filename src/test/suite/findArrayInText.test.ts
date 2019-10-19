import chai = require('chai');
const expect = chai.expect;

import { findArrayInText } from '../../findArrayInText';

suite('Find array in text', () => {
  test('Find simple match', () => {
    expect(
      findArrayInText('[ 1, 2, 3 ]', 3)
    ).to.deep.equal(
      { start: 0, end: 11, text: '[ 1, 2, 3 ]' }
    );
  });
  test('Find across sub array items', () => {
    expect(
      findArrayInText('[ [1], [2], [3] ]', 11)
    ).to.deep.equal({ start: 0, end: 17, text: '[ [1], [2], [3] ]' });
  });
  test('Find with object items', () => {
    expect(
      findArrayInText('[ { "key": 1 }, { "key": 2 }, { "key": 3 } ]', 10)
    ).to.deep.equal(
      { start: 0, end: 44, text: '[ { "key": 1 }, { "key": 2 }, { "key": 3 } ]' }
    );
  });
});
