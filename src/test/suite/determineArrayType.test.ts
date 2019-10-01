import { determineArrayType, ArrayType } from "../../determineArrayType";

import chai = require('chai');
const expect = chai.expect;

suite('Determine array type', () => {

	const UNSUPPORTED_ARRAYS = [
		[],
		[null],
		([1, 'foo'] as any[]),
		([1, null, 'foo'] as any[]),
		([{'foo': 'bar'}, 1]),

	]

	UNSUPPORTED_ARRAYS.forEach(unsupportedArray => {
		test(`should not support array ${JSON.stringify(unsupportedArray)}`, () => {
			expect(determineArrayType(unsupportedArray)).to.be.undefined;
		});
	});

	const SUPPORTED_ARRAYS = [
		[[1], ArrayType.number],
		[[10, 20, 1], ArrayType.number],
		[['foo'], ArrayType.string],
		[['foo', 'bar'], ArrayType.string],
		[[{'age': 10}, {'age': 20}], ArrayType.object]
	]

	SUPPORTED_ARRAYS.forEach(([supportedArray, expectedType]) => {
		test(`should supported supported ${JSON.stringify(supportedArray)}`, () => {
			expect(determineArrayType(supportedArray as any[])).to.equal(expectedType);
		})
	})
});