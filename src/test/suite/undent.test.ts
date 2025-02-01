import { expect } from 'chai';
import {suite, test} from 'mocha';
import { undent } from './undent';

suite("undent", function() {
    test("indent", () => {
      expect(undent`
          [
          1,
          2
          ]
        `).to.be.equal("[\n1,\n2\n]");
    });

    test("more indent", () => {
      expect(undent`
      [
        1,
        2,
        3
      ]`).to.be.equal("[\n  1,\n  2,\n  3\n]")
    });
    test("no indent", () => {
        expect(undent`[
            1, 2, 3
            ]`).to.be.equal("[\n            1, 2, 3\n            ]");
    })
})
