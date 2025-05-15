import {ArrayType, determineArrayType} from './determineArrayType';
import {SortOrder} from './SortOrder';
import {sortObjects} from './sortObjects';
import * as vscode from 'vscode';
import {GenericObject} from './sortObjects/GenericObject';
import {genericSortFn} from './sortNumberOrStrings/genericSortFn';
import {stringSortFn} from './sortNumberOrStrings/stringSortFn';
import { ArrayItem } from '../parser/parseArray';
import { getExtensionConfiguration, SortConfiguration } from '../extensionConfiguration';




async function sortArray(extensionContext: vscode.ExtensionContext, window: typeof vscode.window, 
  array: ArrayItem[], sortOrder: SortOrder): Promise<ArrayItem[] | undefined> {
  const arrayType = determineArrayType(array);
  const extensionConfiguration = getExtensionConfiguration();
  const sortConfiguration: SortConfiguration = {
    collator: new Intl.Collator(
      extensionConfiguration.collation.locales.length === 0? undefined : extensionConfiguration.collation.locales,
      extensionConfiguration.collation),
    order: sortOrder,
  };
  switch (arrayType) {
    case ArrayType.object:
      return sortObjects(extensionContext, window, array as GenericObject[], sortConfiguration) as Promise<ArrayItem[]>;
    case ArrayType.number:
      return array.sort(genericSortFn(sortConfiguration));
    case ArrayType.string:
      // eslint-disable-next-line @typescript-eslint/ban-types
      return (array as String[]).sort(stringSortFn(sortConfiguration)) as ArrayItem[];
    default:
      throw new Error(`This extension can only support arrays that contain only objects, only numbers or only strings.`);
  }
}

export function sortAscending(extensionContext: vscode.ExtensionContext, window: typeof vscode.window, 
  workspace: typeof vscode.workspace, array: ArrayItem[]): Promise<ArrayItem[] | undefined> {
  return sortArray(extensionContext, window, array, SortOrder.ascending);
}

export function sortDescending(extensionContext: vscode.ExtensionContext, window: typeof vscode.window, 
  workspace: typeof vscode.workspace, array: ArrayItem[]): Promise<ArrayItem[] | undefined> {
  return sortArray(extensionContext, window, array, SortOrder.descending);
}
