import parseArray from "../../parseArray";
import chai = require('chai')

const expect = chai.expect

suite('parseArray', () => {
	
    [
        ['[1, 2, 3]', 'json', [1, 2, 3]],
        ['[{"id":1}, {"id":2}]', 'json', [{id: 1}, {id: 2}]],
        ['\n{"id":1}\n{"id":2}\n', 'jsonl', [{id: 1}, {id: 2}]]
    ].forEach((testDefinition) => {
        test(`should parse valid json ${testDefinition[0]}`, () => {
            const array = parseArray(testDefinition[0] as string, testDefinition[1] as string);
            expect(array).to.deep.equal(testDefinition[2])
        });
    })

    test('should throw for invalid json', function(done) {
        try {
            parseArray('["1, 2, 3]', 'json')
        } catch (e) {
            expect(e).to.exist
            done()
        }
    })

});