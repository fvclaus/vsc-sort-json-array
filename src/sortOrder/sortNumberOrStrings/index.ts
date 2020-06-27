import {ArrayType} from '../determineArrayType';
import {SortOrder} from '../SortOrder';
import {genericSortFn} from './genericSortFn';

import * as vscode from 'vscode';

import Window = vscode.window;


export async function sortNumberOrStrings(window: typeof Window, array: (string|number)[], arrayType: ArrayType, sortOrder: SortOrder): Promise<unknown[]> {
  return await array.sort(genericSortFn(sortOrder));
}
