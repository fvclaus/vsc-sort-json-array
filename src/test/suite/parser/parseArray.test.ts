import {expect} from 'chai';
import parseArray, {convertToLiteralValues} from '../../../parser/parseArray';
import {suite, test} from 'mocha';


suite('parseArray', function() {
  ([
    ['[{}]', [{}]],
    ['[{ }]', [{}]],
    ['[]', []],
    ['[""]', [String('')]],
    ['[1, 2, 3]', [1, 2, 3]],
    ['[1.5, \'foo\', 2, -3.5]', [1.5, 'foo', 2, -3.5]],
    ['[1.1234567890]', [1.1234567890]],
    ['["foo", "bar"]', ['foo', 'bar']],
    ['[{"foo": 1}]', [{"foo": 1}]],
    ['[{ "foo" : 1}]', [{foo: 1}]],
    ['[{"foo": [{"bar1": 1}, {"bar2": 2}]}]', [{foo: [{bar1: 1}, {bar2: 2}]}]],
    ['[{"foo": 1,}]', [{foo: 1}]],
    ['[1,]', [1]],
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
      const actualArray = parseArray(json);
      const convertedArray = convertToLiteralValues(actualArray);
      expect(convertedArray).to.deep.equal(expectedArray);
    });
  });

  Object.entries({
    Space: "\u0020",
    NoBreakSpace: "\u00A0",
    OghamSpaceMark: "\u1680",
    EnQuad: "\u2000",
    EmQuad: "\u2001",
    EnSpace: "\u2002",
    EmSpace: "\u2003",
    ThreePerEmSpace: "\u2004",
    FourPerEmSpace: "\u2005",
    SixPerEmSpace: "\u2006",
    FigureSpace: "\u2007",
    PunctuationSpace: "\u2008",
    ThinSpace: "\u2009",
    HairSpace: "\u200A",
    NarrowNoBreakSpace: "\u202F",
    MediumMathematicalSpace: "\u205F",
    IdeographicSpace: "\u3000",
    LineSeparator: "\u2028",
    ParagraphSeparator: "\u2029",
    Tab: "\u0009",
    LineFeed: "\u000A",
    VerticalTab: "\u000B",
    FormFeed: "\u000C",
    CarriageReturn: "\u000D",
    NextLine: "\u0085",
    ZeroWidthNoBreakSpace: "\uFEFF"
  }).forEach(([name, character]) => {
    test(`should parse ${name}`, function() {
      const actualArray = parseArray(`[${character}]`);
      const convertedArray = convertToLiteralValues(actualArray);
      expect(convertedArray).to.deep.equal([]);
    })
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
    ['[null, undefined]'],
    ['[true, false]'],
    ['[[]'],
  ] as [string][]).forEach(([json]) => {
    test(`should not parse ${json}`, function() {
      expect(() => parseArray(json)).to.throw();
    });
  });

});
