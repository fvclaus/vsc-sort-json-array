import chai = require('chai');
import {FileExtension} from '../../fileExtension';
import {suite, test} from 'mocha';
import processAndParseArray from '../../processAndParseArray';
import { undent } from './undent';
import serializeArrayFromTree from '../../serializeArray';

const expect = chai.expect;

suite('serializeArray', function() {

  function expectSerializedArray(original: string, expected: string, 
      {indentLevel, newIndent}: {indentLevel: number, newIndent: string} = {indentLevel: 0, newIndent: '  '},
      fileExtension: FileExtension = FileExtension.OTHER): void {
    const parseResult = processAndParseArray(original, fileExtension);
    const serializedArray = serializeArrayFromTree(parseResult, fileExtension, original, {indentLevel, newIndent} );
    expect(serializedArray).to.deep.equal(expected);
  }

  test("should serialize numbers", function() {
    expectSerializedArray(`[0, 1, 1.5, 2.5e10]`, undent`
      [
        0,
        1,
        1.5,
        2.5e10
      ]
      `)
  })

  test("should serialize strings", function() {
    expectSerializedArray(`['singleQuote', "doubleQuote"]`, undent`
      [
        'singleQuote',
        "doubleQuote"
      ]
      `)
  })

  test("should serialize object", function() {
    expectSerializedArray(`[{'p1': 'singleQuote', p2: null}, {"p1": "doubleQuote", πολύ: false }, {p1: 0, p2: [null, null, null]}]`, undent`
      [
        {
          'p1': 'singleQuote',
          p2: null
        },
        {
          "p1": "doubleQuote",
          πολύ: false
        },
        {
          p1: 0,
          p2: [
            null,
            null,
            null
          ]
        }
      ]
      `)
  })

  test("should serialize nested object", function () {
    expectSerializedArray(`[{o1: { o2: { a: [1, 2, 3]}}}]`, undent`
      [
        {
          o1: {
            o2: {
              a: [
                1,
                2,
                3
              ]
            }
          }
        }
      ]
      `)
  })

  test("should use tabs instead of spaces", function() {
    const original = `[{a: [1, 2]}]`;
    expectSerializedArray(original, `[\n\t{\n\t\ta: [\n\t\t\t1,\n\t\t\t2\n\t\t]\n\t}\n]`, {indentLevel: 0, newIndent: '\t'});
  });

  test("should indent at the correct level", function() {
    expectSerializedArray(`[{a:1}]`, "[\n    {\n      a: 1\n    }\n  ]", {indentLevel: 1, newIndent: '  '})
  })

  test("should serialize JSONL", function() {
    expectSerializedArray(`"string"\n0\n{a: [1, 2, 3], o: {foo: "bar"}}`, undent`
      "string"
      0
      {a: [1, 2, 3], o: {foo: "bar"}}
      `, {indentLevel: 0, newIndent: '\t'}, FileExtension.JSONL)
  })

  suite('Comment Serialization', function() {
    test('should handle comments with different indentation', function() {
      const original = '[\n    // before1\n    "a", // inline1\n    // before2\n    "b", // inline2\n    // after last1\n    // after last2\n  ]';
      const expected = undent`
        [
          // before1
          "a", // inline1
          // before2
          "b", // inline2
          // after last1
          // after last2
        ]
        `;
      expectSerializedArray(original, expected, { indentLevel: 0, newIndent: '  ' });
    });

    test('should serialize comments in objects', function() {
      const original = '[\n  {\n    // objBefore1\n    "a": 1, // objInline1\n    // objBefore2\n    "b": 2 // objInline2\n  } // itemInline\n  // after last\n]';
      const expected = undent`
        [
          {
            // objBefore1
            "a": 1, // objInline1
            // objBefore2
            "b": 2 // objInline2
          } // itemInline
          // after last
        ]
        `;
      expectSerializedArray(original, expected);
    });

    test('should serialize comments in arrays', function() {
      const original = '[\n  [\n    // nestedBefore1\n    "x", // nestedInline1\n    // nestedBefore2\n    "y" // nestedInline2\n  ], // itemInline\n  // after last\n]';
      const expected = undent`
        [
          [
            // nestedBefore1
            "x", // nestedInline1
            // nestedBefore2
            "y" // nestedInline2
          ], // itemInline
          // after last
        ]
        `;
      expectSerializedArray(original, expected);
    });
  });
});
