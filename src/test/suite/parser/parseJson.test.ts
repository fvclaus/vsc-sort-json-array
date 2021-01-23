
import {expect} from 'chai';
import parseArray from '../../../parser/parseArray';


suite('parseArray', function() {
  ([
    ['[{}]', [{}]],
    ['[{ }]', [{}]],
    ['[]', []],
    ['[ \t\n\r]', []],
    ['[""]', ['']],
    ['["\\\\ \\b \\f \\n \\r \\t"]', ['\\\\ \\b \\f \\n \\r \\t']],
    ['[null, undefined]', [null, undefined]],
    ['[1, 2, 3]', [1, 2, 3]],
    ['[1.5, \'foo\', 2, -3.5]', [1.5, 'foo', 2, -3.5]],
    ['[1.1234567890]', [1.1234567890]],
    ['["foo", "bar"]', ['foo', 'bar']],
    ['[{"foo": 1}]', [{foo: 1}]],
    ['[{ "foo" : 1}]', [{foo: 1}]],
    [`["foo'", 'foo"', "\\r\\n", '\u00E9']`, ['foo\'', 'foo"', '\\r\\n', 'é']],
    ['[{"foo": [{"bar1": 1}, {"bar2": 2}]}]', [{foo: [{bar1: 1}, {bar2: 2}]}]],
    ['[true,                 false, null]', [true, false, null]],
    ['[{"foo": 1,}]', [{foo: 1}]],
    ['[1,\t\n\r                      ]', [1]],
    ['[{}]', [{}]],
    ['[]', []],
    ['[{\'foo\': 2}]', [{'foo': 2}]],
    ['[\'\u00e9\']', ['é']],
    ['[1e10, 1e-10, 1E10, 1E-10, -1e-10]', [1e10, 1e-10, 1e10, 1e-10, -1e-10]],
  ] as [string, unknown[]][]).forEach(([json, expectedArray]) => {
    test(`should parse ${json}`, function() {
      const numbers = parseArray(json);
      expect(numbers).to.deep.equal(expectedArray);
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
      expect(() => parseArray(json)).to.throw();
    });
  });


  // TODO Test positions with dangling commas
});
