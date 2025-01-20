import {expect} from 'chai';
import parseArray, {convertToLiteralValues, Range} from '../../../parser/parseArray';
import {suite, test} from 'mocha';
import { undent } from '../undent';


suite('parseArray', function() {
  ([
    ['[{}]', [{}]],
    ['[{ }]', [{}]],
    ['[]', []],
    ['[ \t\n\r]', []],
    ['[""]', [String('')]],
    ['[null, undefined]', [null, undefined]],
    ['[1, 2, 3]', [1, 2, 3]],
    ['[1.5, \'foo\', 2, -3.5]', [1.5, 'foo', 2, -3.5]],
    ['[1.1234567890]', [1.1234567890]],
    ['["foo", "bar"]', ['foo', 'bar']],
    ['[{"foo": 1}]', [{"foo": 1}]],
    ['[{ "foo" : 1}]', [{foo: 1}]],
    ['[{"foo": [{"bar1": 1}, {"bar2": 2}]}]', [{foo: [{bar1: 1}, {bar2: 2}]}]],
    ['[true,                 false, null]', [true, false, null]],
    ['[{"foo": 1,}]', [{foo: 1}]],
    ['[1,\t\n\r                      ]', [1]],
    ['[{}]', [{}]],
    ['[]', []],
    ['[{\'foo\': 2}]', [{'foo': 2}]],
    ['[\'\u00e9\']', ['é']],
    [`["myDanglingComma", ]`, [ "myDanglingComma" ]],
    ['[1e10, 1e-10, 1E10, 1E-10, -1e-10]', [1e10, 1e-10, 1e10, 1e-10, -1e-10]],
    ['[{foo: 1}, {πολύ: 1}, {$10: 2}, {〱〱〱〱: 5}, {KingGeorgeⅦ: 7}, {जावास्क्रिप्ट: "Javascript"}]', 
      [{foo: 1}, {πολύ: 1}, {$10: 2}, {〱〱〱〱: 5}, {KingGeorgeⅦ: 7}, {जावास्क्रिप्ट: "Javascript"}]],
    [`["\u{1f600}"]`, ["😀"]],
  ] as [string, unknown[]][]).forEach(([json, expectedArray]) => {
    test(`should parse ${json}`, function() {
      const [actualArray,] = parseArray(json);
      const convertedArray = convertToLiteralValues(actualArray);
      expect(convertedArray).to.deep.equal(expectedArray);
    });
  });

  ([
    ['[-]'],
    ['[01]'],
    ['[-1.]'],
    ['[1e]'],
    ['[.2]'],
    ['[1e2.2]'],
    ['["foo""bar"]'],
    ['[{]'],
    ['[1{}]'],
    ['[{"a"}]'],
    ['[{"foo": 1, , }]'],
    ['"1"'],
    ['{}'],
    ['[[]'],
  ] as [string][]).forEach(([json]) => {
    test(`should not parse ${json}`, function() {
      expect(() => parseArray(json)).to.throw();
    });
  });

  test(`should find correct ranges for multiline object`, function() {
    const array = undent`
    [
      {
          myEmptyObject: false
      }
    ]
    `;
    const [, actualPositions] = parseArray(array);
    expect(actualPositions).to.deep.equal([new Range([2, 3], [4, 3])]);
  });

  test(`should find correct ranges for string`, function() {
    const array = undent`
    [
     "a"
    ]
    `;
    const [, actualPositions] = parseArray(array);
    expect(actualPositions).to.deep.equal([new Range([2, 2], [2, 4])]);
  });

  test(`should find correct ranges for number`, function() {
    const array = undent`
    [

  1
    ]
    `;
    const [, actualPositions] = parseArray(array);
    expect(actualPositions).to.deep.equal([new Range([3, 1], [3, 1])]);
  });

});
