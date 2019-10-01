import { ArrayType } from '../determineArrayType';
import { SortOrder } from '../SortOrder';
import { genericSortFn } from './genericSortFn';

import * as vscode from 'vscode';

import Window = vscode.window;


export function sortNumberOrStrings(window: typeof Window, array: any[], arrayType: ArrayType, sortOrder: SortOrder): Promise<any[]> {
    return new Promise((resolve, reject) => {
        resolve(array.sort(genericSortFn(sortOrder)));
    });
}
