import {suite, test} from 'mocha';
import { RangeFinder } from '../../findRange';
import { expect } from 'chai';

function undent(strings: TemplateStringsArray): string {
  if (strings.length > 1) {
    throw new Error(`Don't expect this`);
  }

  // Split into lines and remove empty ones at the start and end
  const lines = strings[0].split('\n').filter((line, i, allLines) => {
    const isFirstOrLastLine = i == 0 || i == allLines.length - 1;
    // Empty lines are created when opening and/or closing backticks are on seperate line
    if (isFirstOrLastLine && line.trim() == '') {
      return false;
    }
    return true;
  });

  // Find the minimum indentation
  const minIndent = Math.min(...lines
    .filter(line => line.trim() !== '')
    .map(line => {
      const match = line.match(/^\s*/)![0];
      return match != null? match.length : 0
    })
  );

  // Remove the minimum indentation from all lines
  return lines.map(line => line.slice(minIndent)).join('\n');
}

suite("findRange", () => {
    test("undent", () => {
      expect(undent`
          [
          1,
          2
          ]
        `).to.be.equal("[\n1,\n2\n]");
      expect(undent`[
        1, 2, 3
        ]`).to.be.equal("[\n        1, 2, 3\n        ]");
    });

    test("1 line", () => {
      const rangeFinder = new RangeFinder(undent`
        [
          "a",
        "b",  "c"
        ]
      `);
      expect(rangeFinder.find({start: [2, 3], end: [2, 5]})).to.be.equal(`  "a"`);
      expect(rangeFinder.find({start: [3, 1], end: [3, 3]})).to.be.equal(`"b"`);
      expect(rangeFinder.find({start: [3, 7], end: [3, 9]})).to.be.equal(`"c"`);
    });

    test("2 lines preceeding whitespace", () => {
      const rangeFinder = new RangeFinder(undent`
        [
            {
              x: 2, y: 3 }
        ]
        `);
      expect(rangeFinder.find({start: [2, 5], end: [3, 18]})).to.be.equal("    {\n      x: 2, y: 3 }")
    });

    test("3 lines no preceeding whitespace", () => {
      const rangeFinder = new RangeFinder(undent`
        [
        {
          "foo": "bar"
        }
        ]
        `);
      expect(rangeFinder.find({start: [2, 1], end: [4, 1]})).to.be.equal(undent`
        {
          "foo": "bar"
        }
        `)
    });

    test("4 lines", () => {
      const rangeFinder = new RangeFinder(undent`
        [
        [
        1
        2
        3
                ]
        `)
      expect(rangeFinder.find({start: [2, 1], end: [6, 9]})).to.be.equal(undent`
        [
        1
        2
        3
                ]`)
    });
}) 