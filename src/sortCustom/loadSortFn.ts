import * as ts from 'typescript';
import * as temp from 'temp';
import * as fs from 'fs';

export function loadSortFn(path: string): (a: any, b: any) => number {
    const transpiledModule = ts.transpileModule(fs.readFileSync(path).toString(), {
        reportDiagnostics: true,
        compilerOptions: {
            module: ts.ModuleKind.CommonJS
        }
    });
    const tempFile = temp.openSync();
    fs.writeFileSync(tempFile.path, transpiledModule.outputText);
    const sortModule = require(tempFile.path);
    return sortModule.sort;
}
