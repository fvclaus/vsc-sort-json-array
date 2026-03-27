import * as fs from 'fs';
import { transformSync } from 'amaro';
import withTempFile from './unlinkTempfile';

export function loadSortFn(path: string): (a: unknown, b: unknown) => number {
  return withTempFile((tempFilePath) => {
    const code = fs.readFileSync(path, 'utf8');
    const { code: strippedCode } = transformSync(code);
    
    fs.writeFileSync(tempFilePath, strippedCode);
    
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sortModule = require(tempFilePath);
    return sortModule.sort;
  }, (e) => {
    throw e;
  });
}
