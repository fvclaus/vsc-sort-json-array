import chai = require('chai');
import { validateSortModule } from '../../../sortCustom/validateSortModule';
import { createSourceModulePath } from './createSourceModulePath';
const expect = chai.expect;

suite('Validate sort module', () => {

    [
        ['noExportKeyword', 'Must use export keyword'], 
        ['wrongNumberOfParameters', 'Must have exactly two parameters'],
        ['wrongReturnType', 'Must have return type \'number\'']
    ].forEach(([moduleName, expectedError]) => {
        test(`should detect errors in ${moduleName}`, () => {
            const errors = validateSortModule(createSourceModulePath(`sortModule.${moduleName}.ts`));
            expect(errors).to.have.members([`Sort function is invalid: ${expectedError}.`])
        });
    });
    
});