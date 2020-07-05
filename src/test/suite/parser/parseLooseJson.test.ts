
import {expect} from 'chai';
import parseJson from '../../../parser/parseJson';


suite('parseLooseJson', function() {
  ([
    ['[1, 2, 3]', [1, 2, 3]],
    ['[1.5, \'foo\', 2]', [1.5, 'foo', 2]],
    ['["foo", "bar"]', ['foo', 'bar']],
    ['[{"foo": 1}]', [{foo: 1}]],
    [`["foo'", 'foo"', "\\\\\\r\\n", '\u00E9']`, ['foo\'', 'foo"', '\\\r\n', 'é']],
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
      const numbers = parseJson(json);
      expect(numbers.array).to.deep.equal(expectedArray);
    });
  });

  ([
    ['["\\"]', /Expecting a `"` here/],
    ['[-]', /Expecting a digit here/],
    ['[-1.]', /Expecting a digit here/],
    ['[1e]', /Expecting a digit here/],
    ['[1e2.2]', /Expecting a `,` here/],
    ['["foo""bar"]', /Expecting a `,` here/],
    ['[{]', /Expecting object key here/],
    ['[1{}]', /Expecting a `,` here/],
    ['[{"a"}]', /Expecting a `:` here/],
    ['[{"foo": 1, , }]', /Expecting object key here/],
    ['[[]', /Expecting a `]` here/],
  ] as [string, RegExp][]).forEach(([json, expectedError]) => {
    test(`should not parse ${json}`, function() {
      expect(() => parseJson(json)).to.throw(expectedError);
    });
  });


  // TODO Test positions with dangling commas
});
