import {suite, test} from 'mocha';
import { RangeFinder } from '../../findRange';
import { expect } from 'chai';
import { Range } from '../../parser/parseArray';
import { undent } from './undent';

suite("findRange", () => {

    test("1 line", () => {
      const rangeFinder = new RangeFinder(undent`
        [
          "a",
        "b",  "c"
        ]
      `);
      expect(rangeFinder.find(new Range([2, 3], [2, 5]))).to.be.equal(`  "a"`);
      expect(rangeFinder.find(new Range([3, 1], [3, 3]))).to.be.equal(`"b"`);
      expect(rangeFinder.find(new Range([3, 7], [3, 9]))).to.be.equal(`"c"`);
    });

    test("2 lines preceeding whitespace", () => {
      const rangeFinder = new RangeFinder(undent`
        [
            {
              x: 2, y: 3 }
        ]
        `);
      expect(rangeFinder.find(new Range([2, 5], [3, 18]))).to.be.equal("    {\n      x: 2, y: 3 }")
    });

    test("3 lines no preceeding whitespace", () => {
      const rangeFinder = new RangeFinder(undent`
        [
        {
          "foo": "bar"
        }
        ]
        `);
      expect(rangeFinder.find(new Range([2, 1], [4, 1]))).to.be.equal(undent`
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
      expect(rangeFinder.find(new Range([2, 1], [6, 9]))).to.be.equal(undent`
        [
        1
        2
        3
                ]`)
    });
}) 