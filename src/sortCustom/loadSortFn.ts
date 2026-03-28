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
    let hasExportError = false;

    if (strippedCode.includes('exports.') === true || strippedCode.includes('module.exports') === true) {
      errors.push('Sort function is invalid: CommonJS exports are not supported, use ES Module "export" instead.');
      hasExportError = true;
    }

    if (strippedCode.includes('export') === false) {
      errors.push('Sort function is invalid: Must use export keyword.');
      hasExportError = true;
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
        if (!hasExportError) {
          errors.push('Must define a sort(a, b) function.');
        }
      }

      if (errors.length > 0) {
        return { errors };
      }

      return { sortFn, errors: [] };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      if (!hasExportError) {
        errors.push('Must define a sort(a, b) function.');
      }
      return { errors };
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return { errors: [`Sort function has the following compilation error: ${e.message ?? e}`] };
  }
}
