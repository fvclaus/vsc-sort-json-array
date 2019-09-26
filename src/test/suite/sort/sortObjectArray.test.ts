
import chai = require('chai');
import { sortObjectArray } from '../../../sort/sortObjectArray';
import { SortOrder } from '../../../sort/SortOrder';
const expect = chai.expect;

describe('Sort object array', () => {

    const ROBERT = {'age': 71, 'name': 'Robert', 'instrument': 'Voice'},
        JOHN_PAUL = {'age': 73, 'name': 'John', 'instrument': 'Bass'},
        JOHN = {'age': -1, 'name': 'John', 'instrument': 'Drums'},
        JIMMY = {'age': 75, 'name': 'Jimmy', 'instrument': 'Guitar'},
        ALL = [ROBERT, JOHN, JOHN_PAUL, JIMMY];

    

    it('should return undeterminstic sort order', () => {
        expect(sortObjectArray(ALL, ['name'], SortOrder.ascending)).to.be.false
    });

    it('should sort object in ascending order', () => {
        const array = ALL.slice();
        expect(sortObjectArray(array, ['age'], SortOrder.ascending)).to.be.true
        expect(array).to.deep.equal([JOHN, ROBERT, JOHN_PAUL, JIMMY]);
    });

    it('should sort object in descending order', () => {
        const array = ALL.slice();
        expect(sortObjectArray(array, ['age'], SortOrder.descending)).to.be.true
        expect(array).to.deep.equal([JIMMY, JOHN_PAUL, ROBERT, JOHN]);
    });

    it('should sort with two properties', () => {
        const array = ALL.slice();
        expect(sortObjectArray(array, ['name', 'instrument'], SortOrder.ascending)).to.be.true
        expect(array).to.deep.equal([JIMMY, JOHN_PAUL, JOHN, ROBERT]);
    });
});