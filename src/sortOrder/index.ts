import {ArrayType, determineArrayType} from './determineArrayType';
import {SortOrder} from './SortOrder';
import {sortObjects} from './sortObjects';
import * as vscode from 'vscode';
import {GenericObject} from './sortObjects/GenericObject';
import {genericSortFn} from './sortNumberOrStrings/genericSortFn';
import {stringSortFn} from './sortNumberOrStrings/stringSortFn';
import { ArrayItem } from '../parser/parseArray';


type CollationLocale = string[];
type CollationCaseFirst = 'upper' | 'lower' | 'false'
export interface ExtensionConfiguration {
  collation: {
    ignorePunctuation: boolean,
    caseFirst: CollationCaseFirst
    numeric: boolean,
    locales: CollationLocale
  }
}

function getExtensionConfiguration() : ExtensionConfiguration {
  const config = vscode.workspace.getConfiguration('sortJsonArray.collation');
  // sensitivity was not added because its default setting 'variant' is the only logical setting for sorting.
  // 'variant' will treat á, a and ä as different characters and create a deterministic sort order
  // 'base' will treat them as the same character, appending them in the current order at "the end":
  // ['a', 'ä', 'á'] is a valid sort order with 'base' (as is ['ä', 'a', 'á'] or any permutation of the characters),
  // 'variant' will always sort as ['a', 'á, 'ä']
  return {
    collation: {
      ignorePunctuation: config.get('ignorePunctuation') as boolean,
      caseFirst: config.get('caseFirst') as CollationCaseFirst,
      numeric: config.get('numeric') as boolean,
      locales: config.get('locales') as CollationLocale,
    },
  };
}

export interface SortConfiguration {
  order: SortOrder,
  collator: Intl.Collator
}

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
