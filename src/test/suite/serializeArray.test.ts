import chai = require('chai')
import serializeArray from "../../serializeArray";

const expect = chai.expect

suite('serializeArray', () => {
	
    [
        [[1, 2, 3], 'json', '[1,2,3]'],
        [[{id: 1}, {id: 2}], 'json', '[{"id":1},{"id":2}]'],
        [[{id: 1}, {id: 2}], 'jsonl', '{"id":1}\n{"id":2}']
    ].forEach((testDefinition) => {
        test(`should serialize array ${testDefinition[2]}`, () => {
            const serializedArray = serializeArray(testDefinition[0] as any[], testDefinition[1] as string);
            expect(serializedArray).to.deep.equal(testDefinition[2])
        });
    })

});