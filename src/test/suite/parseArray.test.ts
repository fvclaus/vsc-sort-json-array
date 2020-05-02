import parseArray from "../../parseArray";
import chai = require('chai');
import { FileExtension } from "../../fileExtension";

const expect = chai.expect;

suite('parseArray', () => {
	
    ([
        ['[1, 2, 3]', FileExtension.JSON, [1, 2, 3]],
        ['[{"id":1}, {"id":2}]', FileExtension.JSON, [{id: 1}, {id: 2}]],
        ['\n{"id":1}\n{"id":2}\n', FileExtension.JSONL, [{id: 1}, {id: 2}]]
    ] as [string, FileExtension, any[]][]).forEach(([json, fileExtension, expectedArray]) => {
        test(`should parse valid json ${json}`, () => {
            const array = parseArray(json, fileExtension);
            expect(array).to.deep.equal(expectedArray);
        });
    });

    test('should throw for invalid json', function(done) {
        try {
            parseArray('["1, 2, 3]', FileExtension.JSON);
        } catch (e) {
            expect(e.message).to.satisfy((msg: string) => msg.startsWith('Cannot parse selection as JSON.'));
            done();
        }
    });

    test('should throw if json is not array', function(done) {
        try {
            parseArray('{"a": 1}', FileExtension.JSON);            
        } catch (e) {
            expect(e.message).to.equal('Selection is a function Object() { [native code] } not an array.');
            done();
        }
    });

});