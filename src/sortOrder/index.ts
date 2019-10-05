import { ArrayType, determineArrayType } from './determineArrayType';
import { SortOrder } from './SortOrder';
import { sortObjects } from './sortObjects';
import { sortNumberOrStrings } from './sortNumberOrStrings';
import * as vscode from 'vscode';

function sortArray(window: typeof vscode.window, array: any[], sortOrder: SortOrder): Promise<any[]> {
    const arrayType = determineArrayType(array);
    switch (arrayType) {
        case ArrayType.object:
            return sortObjects(window, array, sortOrder);
        case ArrayType.number:
        case ArrayType.string:
            return sortNumberOrStrings(window, array, arrayType, sortOrder);
        default:
            return Promise.reject(`This array is not yet supported.`);
    }
}

export function sortAscending(window: typeof vscode.window, workspace: typeof vscode.workspace, array: any[]) {
    return sortArray(window, array, SortOrder.ascending);
}

export function sortDescending(window: typeof vscode.window, workspace: typeof vscode.workspace, array: any[]) {
    return sortArray(window, array, SortOrder.descending);
}