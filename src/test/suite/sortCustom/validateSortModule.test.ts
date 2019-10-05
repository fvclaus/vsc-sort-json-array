import * as ts from 'typescript';
import * as fs from 'fs';

import chai = require('chai');
import { validateSortModule } from '../../../sortCustom/validateSortModule';
const expect = chai.expect;

suite('Validate sort module', () => {

    [
        ['noExportKeyword', 'Must use export keyword'], 
        ['wrongNumberOfParameters', 'Must have exactly two parameters'],
        ['wrongReturnType', 'Must have return type \'number\'']
    ].forEach(([moduleName, expectedError]) => {
        test(`should detect errors in ${moduleName}`, () => {
            const path = `${__dirname}/sortModule.${moduleName}.ts`.replace('/out', '/src');
            const errors = validateSortModule(path);
            expect(errors).to.have.members([`Sort function is invalid: ${expectedError}.`])
        });
    });
    
});