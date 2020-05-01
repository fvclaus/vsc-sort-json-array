import chai = require('chai');
import { validateSortModule } from '../../../sortCustom/validateSortModule';
const expect = chai.expect;
import * as temp from 'temp';
import * as fs from 'fs';
import { createSourceModulePath } from './storagePathFsUtils';

suite('Validate sort module', () => {

    [
        ['noExportKeyword', 'Must use export keyword'], 
        ['wrongNumberOfParameters', 'Must have exactly two parameters'],
        ['wrongReturnType', 'Must have return type \'number\'']
    ].forEach(([moduleName, expectedError]) => {
        test(`should detect errors in ${moduleName}`, () => {
            const errors = validateSortModule(createSourceModulePath(`sortModule.${moduleName}`));
            expect(errors).to.have.members([`Sort function is invalid: ${expectedError}.`])
        });
    });

    test('should detect missing sort function', () => {
        const errors = validateSortModule(createSourceModulePath(`sortModule.noSortFunction`));
        expect(errors).to.have.members(['Must define a sort(a, b) function.'])
    })

    test('should detect invalid typescript', () => {
        const unclosedQuotationMark = `function sort(a: any, b: any): number {
            const runawayString = 'fo;
            return -1;
        }`
        const tempPath = temp.openSync();
        fs.writeFileSync(tempPath.path, unclosedQuotationMark);
        const errors = validateSortModule(tempPath.path);
        try {
            fs.unlinkSync(tempPath.path);
        } catch(e) {
            // Ignore errors
        }
        expect(errors).to.have.members(['Does not compile. Please check the problems view.']);
    });

});