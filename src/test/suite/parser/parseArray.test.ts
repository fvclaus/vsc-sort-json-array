
import {expect} from 'chai';
import parseArray, {stringTextToStringValue} from '../../../parser/parseArray';
import {suite, test} from 'mocha';
import { readFileSync } from 'node:fs';


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
      const [numbers, _] = parseArray(json, {doubleEscape: true});
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


  ([
    ['rangeTest1.js', [[[2, 3], [4, 3]], [[8, 3], [8, 28]]]],
  ] as [string, [[number, number], [number, number]][]][]).forEach(([filepath, rawPositions]) => {
    test(`should convert string text ${filepath} to string value`, function() {
      const arrayString = readFileSync(`src/test/suite/parser/range/${filepath}`, ).toString()
      const positions = rawPositions.map(([start, end]) => {
        return {start, end};
      })
      const [_, actualPositions] = parseArray(arrayString, {doubleEscape: true});
      expect(actualPositions).to.deep.equal(positions);
    });
  });

  // TODO Test positions with dangling commas
});
