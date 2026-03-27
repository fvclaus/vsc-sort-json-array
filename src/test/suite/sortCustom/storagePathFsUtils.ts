import * as mvFile from 'mv';
import * as path from 'path';

export function mvDir(from: string, to: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mvFile.default(from, to, {mkdirp: true}, (error) => {
      if (error != null) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export function createSourceModulePath(module: string): string {
  return path.join(__dirname, 'sortModules', `${module}.ts`).replace(`${path.sep}out`, `${path.sep}src`);
}
