import {ArrayType, determineArrayType} from './determineArrayType';
import {SortOrder} from './SortOrder';
import {sortObjects} from './sortObjects';
import * as vscode from 'vscode';
import {GenericObject} from './sortObjects/GenericObject';
import {genericSortFn} from './sortNumberOrStrings/genericSortFn';
import {stringSortFn} from './sortNumberOrStrings/stringSortFn';


type CollationLocale = string[];
type CollactionCaseFirst = 'upper' | 'lower' | 'false'
export interface ExtensionConfiguration {
  collation: {
    ignorePunctuation: boolean,
    caseFirst: CollactionCaseFirst
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
      caseFirst: config.get('caseFirst') as CollactionCaseFirst,
      numeric: config.get('numeric') as boolean,
      locales: config.get('locales') as CollationLocale,
    },
  };
}

export interface SortConfiguration {
  order: SortOrder,
  collator: Intl.Collator
}

async function sortArray(window: typeof vscode.window, array: unknown[], sortOrder: SortOrder): Promise<unknown[] | undefined> {
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
      return sortObjects(window, array as GenericObject[], sortConfiguration);
    case ArrayType.number:
      return array.sort(genericSortFn(sortConfiguration));
    case ArrayType.string:
      return (array as string[]).sort(stringSortFn(sortConfiguration));
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
