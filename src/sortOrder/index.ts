import {ArrayType, determineArrayType} from './determineArrayType';
import {SortOrder} from './SortOrder';
import {sortObjects} from './sortObjects';
import {sortNumberOrStrings} from './sortNumberOrStrings';
import * as vscode from 'vscode';
import {GenericObject} from './sortObjects/GenericObject';

async function sortArray(window: typeof vscode.window, array: unknown[], sortOrder: SortOrder): Promise<unknown[] | undefined> {
  const arrayType = determineArrayType(array);
  switch (arrayType) {
    case ArrayType.object:
      return sortObjects(window, array as GenericObject[], sortOrder);
    case ArrayType.number:
    case ArrayType.string:
      return sortNumberOrStrings(window, array as (string|number)[], arrayType, sortOrder);
    default:
      throw new Error(`This array is not yet supported.`);
  }
}

export function sortAscending(window: typeof vscode.window, workspace: typeof vscode.workspace, array: unknown[]): Promise<unknown[] | undefined> {
  return sortArray(window, array, SortOrder.ascending);
}

export function sortDescending(window: typeof vscode.window, workspace: typeof vscode.workspace, array: unknown[]): Promise<unknown[] | undefined> {
  return sortArray(window, array, SortOrder.descending);
}
