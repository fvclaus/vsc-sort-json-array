import chai = require('chai');
import {FileExtension} from '../../fileExtension';
import {suite, test} from 'mocha';
import processAndParseArray from '../../processAndParseArray';
import { undent } from './undent';
import serializeArrayFromTree from '../../serializeArray';

const expect = chai.expect;

suite('serializeArray', function() {

  function expectSerializedArray(original: string, expected: string, 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options?: {indentLevel?: number, newIndent?: string, sortFn?: (a: any, b: any) => number},
      fileExtension: FileExtension = FileExtension.OTHER): void {
    const parseResult = processAndParseArray(original, fileExtension);
    const items = parseResult.items;
    const optionsWithDefaults = {indentLevel: 0, newIndent: '  ', sort: false, ...options};
    if (typeof optionsWithDefaults.sortFn !== 'undefined') {
      items.sort(optionsWithDefaults.sortFn);
    }
    const serializedArray = serializeArrayFromTree({...parseResult, items}, fileExtension, original, optionsWithDefaults );
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

  test('comments in string array', function() {
    const original = `[ // arrayInline
      // before1
      "a", // inline1
      // before2
      "b", // inline2
      // before 3
      // before 4
      "c",
      // after last1
      // after last2
    ]`;
    const expected = undent`
      [ // arrayInline
        // before1
        "a", // inline1
        // before2
        "b", // inline2
        // before 3
        // before 4
        "c"
        // after last1
        // after last2
      ]
      `;
    expectSerializedArray(original, expected, { indentLevel: 0, newIndent: '  ' });
  });

  test('comments in object array', function() {
    const original = undent`
      [
        {    // objInlineBefore
      // objBefore1
      // objBefore2
      "a": 1, // objInline1
      // objBefore2
      "b": 2 // objInline2
      // objAfter 1
      // objAfter 2
        } // objInlineAfter
        // after last 1
        // after last 2
      ]
    `;
    const expected = undent`
      [
        { // objInlineBefore
          // objBefore1
          // objBefore2
          "a": 1, // objInline1
          // objBefore2
          "b": 2 // objInline2
          // objAfter 1
          // objAfter 2
        } // objInlineAfter
        // after last 1
        // after last 2
      ]
      `;
    expectSerializedArray(original, expected);
  });

  test('comments in nested array', function() {
    const original = undent`
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
    const expected = undent`
      [
        [
          // nestedBefore1
          "x", // nestedInline1
          // nestedBefore2
          "y" // nestedInline2
        ] // itemInline
        // after last
      ]
      `;
    expectSerializedArray(original, expected);
  });

  test('comments in empty objects and arrays', function() {
    const original = undent`
      [
        {

        "array": [
        // array comment
        // array comment comment
        ],
        "object": {
          // object comment 1
          // object comment 2
          // object comment 3
          // object comment 4
        }
      }
      ]
      `;
    const expected = undent`
      [
        {
          "array": [
            // array comment
            // array comment comment
          ],
          "object": {
            // object comment 1
            // object comment 2
            // object comment 3
            // object comment 4
          }
        }
      ]
      `;
    expectSerializedArray(original, expected);
  });

  test('comments after sorting', function() {
    const original = undent`
      [
        {
          "id": 2 // id 2
          // end 2
        },
        {
          "id": 1 // id 1
          // end 1
        }
      ]
      `;
    const expected = undent`
      [
        {
          "id": 1 // id 1
          // end 1
        },
        {
          "id": 2 // id 2
          // end 2
        }
      ]
      `;

    expectSerializedArray(original, expected, {sortFn: (a, b) => a.id - b.id});
  })

  test('multi-line comments in string array', function() {
    const original = undent`
      [ /* arrayInline */
        /* before1 */
        "a", /* inline1 */
        /* before2 */
        "b", /* inline2 */
        /*
         * before 3
         * before 4
         */
        "c",
        /* after last1 */
        /* after last2 */
      ]`;
    const expected = undent`
      [ /* arrayInline */
        /* before1 */
        "a", /* inline1 */
        /* before2 */
        "b", /* inline2 */
        /*
         * before 3
         * before 4
         */
        "c"
        /* after last1 */
        /* after last2 */
      ]
      `;
    expectSerializedArray(original, expected, { indentLevel: 0, newIndent: '  ' });
  });

  test('multi-line comments in object array', function() {
    const original = undent`
      [
        {    /* objInlineBefore */
      /* objBefore1 */
      /* objBefore2 */
      "a": 1, /* objInline1 */
      /* objBefore2 */
      "b": 2 /* objInline2 */
      /* objAfter 1 */
      /* objAfter 2 */
        } /* objInlineAfter */
        /* after last 1 */
        /* after last 2 */
      ]
    `;
    const expected = undent`
      [
        { /* objInlineBefore */
          /* objBefore1 */
          /* objBefore2 */
          "a": 1, /* objInline1 */
          /* objBefore2 */
          "b": 2 /* objInline2 */
          /* objAfter 1 */
          /* objAfter 2 */
        } /* objInlineAfter */
        /* after last 1 */
        /* after last 2 */
      ]
      `;
    expectSerializedArray(original, expected);
  });

  test('multi-line comments in nested array', function() {
    const original = undent`
      [
        [
      /* nestedBefore1 */
      "x", /* nestedInline1 */
      /* nestedBefore2 */
      "y" /* nestedInline2 */
        ], /* itemInline */
        /* after last */
      ]
      `;
    const expected = undent`
      [
        [
          /* nestedBefore1 */
          "x", /* nestedInline1 */
          /* nestedBefore2 */
          "y" /* nestedInline2 */
        ] /* itemInline */
        /* after last */
      ]
      `;
    expectSerializedArray(original, expected);
  });

  test('multi-line comments in empty objects and arrays', function() {
    const original = undent`
      [
        {
          "array": [
          /* array comment */
          /* array comment comment */
          ],
          "object": {
            /* object comment 1 */
            /* object comment 2 */
            /* object comment 3 */
            /* object comment 4 */
          }
        }
      ]
      `;
    const expected = undent`
      [
        {
          "array": [
            /* array comment */
            /* array comment comment */
          ],
          "object": {
            /* object comment 1 */
            /* object comment 2 */
            /* object comment 3 */
            /* object comment 4 */
          }
        }
      ]
      `;
    expectSerializedArray(original, expected);
  });

  test('multi-line comments after sorting', function() {
    const original = undent`
      [
        {
          "id": 2 /* id 2 */
          /* end 2 */
        },
        {
          "id": 1 /* id 1 */
          /* end 1 */
        }
      ]
      `;
    const expected = undent`
      [
        {
          "id": 1 /* id 1 */
          /* end 1 */
        },
        {
          "id": 2 /* id 2 */
          /* end 2 */
        }
      ]
      `;

    expectSerializedArray(original, expected, {sortFn: (a, b) => a.id - b.id});
  })

});
