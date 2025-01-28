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
    const parsedArray = processAndParseArray(original, fileExtension);
    const serializedArray = serializeArrayFromTree(parsedArray, fileExtension, original, {indentLevel, newIndent} );
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

});
