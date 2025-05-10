import {expect} from 'chai';
import parseArray, {CommentInfo, convertToLiteralValues} from '../../../parser/parseArray';
import {suite, test} from 'mocha';
import { undent } from '../undent';


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
      const parseResult = parseArray(json);
      const convertedArray = convertToLiteralValues(parseResult.items);
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
      const parseResult = parseArray(`[${character}]`);
      const convertedArray = convertToLiteralValues(parseResult.items);
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

    test('should collect inline comments from array elements', function() {
      const json = '[\n  "a", // comment1\n  "b" // comment2\n]';
      const result = parseArray(json);
      expect(result.items.length).to.equal(2);
      const expectedComments: Partial<CommentInfo>[] = [
        { text: '// comment1', line: 1, column: 7 },
        { text: '// comment2', line: 2, column: 6 }  
      ];
      expect(result.allCommentTokens).to.deep.members(expectedComments);
    });

    test('should collect inline comments from object properties (comments are collected globally)', function() {
      const json = '[\n  { "a": 1, // commentA\n    "b": 2 // commentB\n  }\n]';
      const result = parseArray(json);
      expect(result.items.length).to.equal(1);
      const expectedComments: Partial<CommentInfo>[] = [
        { text: '// commentA', line: 1, column: 12 }, 
        { text: '// commentB', line: 2, column: 11 }  
      ];
      expect(result.allCommentTokens).to.deep.members(expectedComments);
    });

    test('should collect comments on lines before array elements', function() {
      const json = '[\n  // comment1\n  "a",\n  // comment2\n  "b"\n]';
      const result = parseArray(json);
      expect(result.items.length).to.equal(2);
      const expectedComments: Partial<CommentInfo>[] = [
        { text: '// comment1', line: 1, column: 2 }, 
        { text: '// comment2', line: 3, column: 2 }  
      ];
      expect(result.allCommentTokens).to.deep.members(expectedComments);
    });

    test('should collect comments on lines before object properties (comments are collected globally)', function() {
      const json = '[\n  {\n    // commentA\n    "a": 1,\n    // commentB\n    "b": 2\n  }\n]';
      const result = parseArray(json);
      expect(result.items.length).to.equal(1);
      const expectedComments: Partial<CommentInfo>[] = [
        { text: '// commentA', line: 2, column: 4 }, 
        { text: '// commentB', line: 4, column: 4 }  
      ];
      expect(result.allCommentTokens).to.deep.members(expectedComments);
    });

    test('should collect comments after the last array element (within the array brackets)', function() {
      const json = '[\n  "a",\n  "b"\n  // comment after last 1\n  // comment after last 2\n]';
      const result = parseArray(json);
      expect(result.items.length).to.equal(2);
      const expectedComments: Partial<CommentInfo>[] = [
        { text: '// comment after last 1', line: 3, column: 2 }, 
        { text: '// comment after last 2', line: 4, column: 2 }  
      ];
      expect(result.allCommentTokens).to.deep.members(expectedComments);
    });

    test('should handle a mix of comment types and collect them all', function() {
      const json = undent`
      [
        // before1
        "a", // inline1
        // before2
        "b", // inline2
        // after last1
        // after last2
      ]`;
      const result = parseArray(json);
      expect(result.items.length).to.equal(2);
      expect(result.allCommentTokens.length).to.equal(6);

      // Check properties of each comment
      const expectedComments: Partial<CommentInfo>[] = [
        { text: '// before1', line: 1, column: 2 }, 
        { text: '// inline1', line: 2, column: 7 }, 
        { text: '// before2', line: 3, column: 2 }, 
        { text: '// inline2', line: 4, column: 7 }, 
        { text: '// after last1', line: 5, column: 2 }, 
        { text: '// after last2', line: 6, column: 2 }  
      ];

      expect(result.allCommentTokens).to.deep.members(expectedComments);
    });

});
