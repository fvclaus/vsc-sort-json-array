import * as path from 'path';


export function createSourceModulePath(module: string) {
    return path.join(__dirname, module).replace(`${path.sep}out`, `${path.sep}src`)
}