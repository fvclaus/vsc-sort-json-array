
import {expect} from 'chai';
import parseArray, {Range, stringTextToStringValue} from '../../../parser/parseArray';
import {suite, test} from 'mocha';
import { readFileSync } from 'node:fs';
import { undent } from '../undent';


suite('parseArray', function() {
  ([
    ['[{}]', [{}]],
    ['[{ }]', [{}]],
    ['[]', []],
    ['[ \t\n\r]', []],
    ['[""]', ['']],
    ['["\\\\ \\b \\f \\n \\r \\t"]', ['\\ \b \f \n \r \t']],
    ['[null, undefined]', [null, undefined]],
    ['[1, 2, 3]', [1, 2, 3]],
    ['[1.5, \'foo\', 2, -3.5]', [1.5, 'foo', 2, -3.5]],
    ['[1.1234567890]', [1.1234567890]],
    ['["foo", "bar"]', ['foo', 'bar']],
    ['[{"foo": 1}]', [{"foo": 1}]],
    ['[{ "foo" : 1}]', [{foo: 1}]],
    [`["foo'", 'foo"', "\\r\\n", '\u00E9']`, ['foo\'', 'foo"', '\r\n', 'é']],
    // TODO This doesn't work. At least not in JSON
    // String handling in JS and JSON is different. JSON needs double escapes, JS doesn't
    // [`["\r", "\\r", "\\\r", "\\\\r"]`, ["\r", "\\r", "\\\r", "\\\\r"]],
    ['[{"foo": [{"bar1": 1}, {"bar2": 2}]}]', [{foo: [{bar1: 1}, {bar2: 2}]}]],
    ['[true,                 false, null]', [true, false, null]],
    ['[{"foo": 1,}]', [{foo: 1}]],
    ['[1,\t\n\r                      ]', [1]],
    ['[{}]', [{}]],
    ['[]', []],
    ['[{\'foo\': 2}]', [{'foo': 2}]],
    ['[\'\u00e9\']', ['é']],
    ['[1e10, 1e-10, 1E10, 1E-10, -1e-10]', [1e10, 1e-10, 1e10, 1e-10, -1e-10]],
    ['["F:\\\\Apps\\\\a"]', ['F:\\Apps\\a']],
    ['[{foo: 1}, {πολύ: 1}, {$10: 2}, {〱〱〱〱: 5}, {KingGeorgeⅦ: 7}, {जावास्क्रिप्ट: "Javascript"}]', 
      [{foo: 1}, {πολύ: 1}, {$10: 2}, {〱〱〱〱: 5}, {KingGeorgeⅦ: 7}, {जावास्क्रिप्ट: "Javascript"}]],
    [`["\u{1f600}"]`, ["😀"]],
  ] as [string, unknown[]][]).forEach(([json, expectedArray]) => {
    test(`should parse ${json}`, function() {
      const [numbers,] = parseArray(json, {doubleEscape: true});
      expect(numbers).to.deep.equal(expectedArray);
      // expect(JSON.parse(json)).to.deep.equal(expectedArray);
    });
  });

  ([
    ['["\\x"]'],
    ['["\\"]'],
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
      expect(() => parseArray(json, {doubleEscape: true})).to.throw();
    });
  });

  ([
    ['nothingSpecial', 'nothingSpecial'],
    ['\\b\\f\\\\\n\\r\\t\'', '\b\f\\\n\r\t\''],
    ['a\u0300: a with grave accent', 'à: a with grave accent'],
    ['\\uD83D\\uDE00', '😀'],
  ] as [string, string][]).forEach(([stringText, stringValue]) => {
    test(`should convert string text ${stringText} to string value`, function() {
      expect(stringTextToStringValue(stringText)).to.equal(stringValue);
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
    const [, actualPositions] = parseArray(array, {doubleEscape: true});
    expect(actualPositions).to.deep.equal([new Range([2, 3], [4, 3])]);
  });

  test(`should find correct ranges for string`, function() {
    const array = undent`
    [
     "a"
    ]
    `;
    const [, actualPositions] = parseArray(array, {doubleEscape: true});
    expect(actualPositions).to.deep.equal([new Range([2, 2], [2, 4])]);
  });

  test(`should find correct ranges for number`, function() {
    const array = undent`
    [

  1
    ]
    `;
    const [, actualPositions] = parseArray(array, {doubleEscape: true});
    expect(actualPositions).to.deep.equal([new Range([3, 1], [3, 1])]);
  });



  // TODO Test positions with dangling commas
});
