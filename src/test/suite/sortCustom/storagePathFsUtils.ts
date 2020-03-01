import * as mvFile from 'mv';
import * as rimraf from 'rimraf';
import * as path from 'path';

export function rm(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
        rimraf(path, error => {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}

export function mvDir(from: string, to: string): Promise<any> {
    return new Promise((resolve, reject) => {
        mvFile(from, to, { mkdirp: true }, error => {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}

export function createSourceModulePath(module: string) {
    return path.join(__dirname, 'sortModules', `${module}.ts`).replace(`${path.sep}out`, `${path.sep}src`)
}