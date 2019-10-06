import * as glob from 'glob';

export function generateUniqueSortModuleName(globalStoragePath: string) {
    const numberedSortModuleRegex = /sort\.(\d+)\.ts/;
    const sortModules = glob.sync(`sort.*.ts`, {
        cwd: globalStoragePath
    })
        .filter(module => module.match(numberedSortModuleRegex))
        .map(module => parseInt((module.match(numberedSortModuleRegex) as any[])[1]));
    sortModules.sort((a, b) => b - a);
    sortModules.push(0);
    return `sort.${sortModules[0] + 1}.ts`;
}
