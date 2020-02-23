import * as ts from 'typescript';
import * as fs from 'fs';
import withTempFile from './unlinkTempfile';

export function loadSortFn(path: string): (a: any, b: any) => number {
    return withTempFile(tempFilePath => {
        const transpiledModule = ts.transpileModule(fs.readFileSync(path).toString(), {
            reportDiagnostics: true,
            compilerOptions: {
                module: ts.ModuleKind.CommonJS
            }
        });
        fs.writeFileSync(tempFilePath, transpiledModule.outputText);
        const sortModule = require(tempFilePath);
        return sortModule.sort;
    }, (e) => {
        throw e
    })
}
