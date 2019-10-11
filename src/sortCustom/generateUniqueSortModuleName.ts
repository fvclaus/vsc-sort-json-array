import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';



const TEMPLATE = `
/**
 * Implement your sort logic here.
 * Test your function by saving your file to receive a preview of the sorted array in the 'Output' view.
 * Close this file to apply the function to the actual array.
 */
export function sort(a: any, b: any): number {
    return 0;
}
`

export function createNewSortModule(globalStoragePath: string) {
    const numberedSortModuleRegex = /sort\.(\d+)\.ts/;
    const sortModules = glob.sync(`sort.*.ts`, {
        cwd: globalStoragePath
    })
        .filter(module => module.match(numberedSortModuleRegex))
        .map(module => parseInt((module.match(numberedSortModuleRegex) as any[])[1]));
    sortModules.sort((a, b) => b - a);
    sortModules.push(0);
    const moduleName =  `sort.${sortModules[0] + 1}.ts`;
    const modulePath = path.join(globalStoragePath, moduleName);
    fs.writeFileSync(modulePath, TEMPLATE, {
        flag: 'w+'
    });
    return moduleName;
}
