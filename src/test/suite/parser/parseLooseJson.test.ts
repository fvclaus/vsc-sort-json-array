
import {expect} from 'chai';
import fakeParseJSON from '../../../parser/fakeParser';
import parseLooseJson from '../../../parser/parseLooseJson';

suite('parseLooseJson', function() {
  ([
    ['[1, 2, 3]', [1, 2, 3]],
    ['[1.5, \'foo\', 2]', [1.5, 'foo', 2]],
    ['["foo", "bar"]', ['foo', 'bar']],
    ['[{"foo": 1}]', [{foo: 1}]],
    ['[{"foo": [{"bar1": 1}, {"bar2": 2}]}]', [{foo: [{bar1: 1}, {bar2: 2}]}]],
    ['[true, false, null]', [true, false, null]],
  ] as [string, unknown[]][]).forEach(([json, expectedArray]) => {
    test(`should parse ${json}`, function() {
      const numbers = parseLooseJson(json);
      expect(numbers).to.deep.equal(expectedArray);
    });
  });
});
