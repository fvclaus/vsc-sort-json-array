import * as fs from 'fs';
import { transformSync } from 'amaro';
import withTempFile from './unlinkTempfile';

export type SortFn = (a: unknown, b: unknown) => number;

export function loadSortFn(path: string): { sortFn?: SortFn, errors: string[] } {
  try {
    const code = fs.readFileSync(path, 'utf8');
    const transformResult = transformSync(code, { mode: 'transform' });
    const strippedCode = transformResult.code;

    const errors: string[] = [];

    if (strippedCode.includes('exports.') === true || strippedCode.includes('module.exports') === true) {
      return {errors: ['Sort function is invalid: CommonJS exports are not supported, use ES Module "export" instead.']};
    }

    if (strippedCode.includes('export') === false) {
      return {errors: ['Sort function is invalid: Must use export keyword.']};
    }

    try {
      const sortFn = withTempFile((tempFilePath) => {
        fs.writeFileSync(tempFilePath, strippedCode);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const sortModule = require(tempFilePath);
        return sortModule.sort;
      }, (e) => {
        throw e;
      });

      if (typeof sortFn === 'function') {
        if (sortFn.length !== 2) {
          errors.push('Sort function is invalid: Must have exactly two parameters.');
        }
      } else {
        errors.push('Must define a sort(a, b) function.');
      }

      if (errors.length > 0) {
        return { errors };
      }

      return { sortFn, errors: [] };
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
    if (errors.length == 0) {
      // This is prefixed with the module name higher in the stack
        errors.push(`${e.message ?? e}`);
      }
      return { errors };
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // This is prefixed with the module name higher in the stack
    return { errors: [`${e.message ?? e}`] };
  }
}
