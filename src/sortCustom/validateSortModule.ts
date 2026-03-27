import * as fs from 'fs';
import { transformSync } from 'amaro';
import { loadSortFn } from './loadSortFn';

export function validateSortModule(path: string): string[] {
  const code = fs.readFileSync(path, 'utf8');
  try {
    const transformResult = transformSync(code) as { code: string };
    const strippedCode = transformResult.code;
    
    const errors: string[] = [];
    let hasExportError = false;
    
    // Check for CommonJS exports
    if (strippedCode.includes('exports.') === true || strippedCode.includes('module.exports') === true) {
      errors.push('Sort function is invalid: CommonJS exports are not supported, use ES Module "export" instead.');
      hasExportError = true;
    }

    if (strippedCode.includes('export') === false) {
        errors.push('Sort function is invalid: Must use export keyword.');
        hasExportError = true;
    }

    try {
      const sortFn = loadSortFn(path);
      if (typeof sortFn === 'function') {
        if (sortFn.length !== 2) {
          errors.push('Sort function is invalid: Must have exactly two parameters.');
        }
      } else {
        if (!hasExportError) {
          errors.push('Must define a sort(a, b) function.');
        }
      }
    } catch (e) {
       if (!hasExportError) {
         errors.push('Must define a sort(a, b) function.');
       }
    }

    return errors;
  } catch (e) {
    return ['Does not compile. Please check the problems view.'];
  }
}
