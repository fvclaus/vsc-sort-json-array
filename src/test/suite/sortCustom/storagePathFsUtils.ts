import * as mvFile from 'mv';
import * as rimraf from 'rimraf';
import * as path from 'path';

export function rm(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    rimraf(path, (error) => {
      if (error != null) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export function mvDir(from: string, to: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mvFile(from, to, {mkdirp: true}, (error) => {
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
