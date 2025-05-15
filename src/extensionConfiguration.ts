import * as vscode from 'vscode';
import { SortOrder } from './sortOrder/SortOrder';

export type CollationLocale = string[];
export type CollationCaseFirst = 'upper' | 'lower' | 'false'
export interface SortConfiguration {
  order: SortOrder,
  collator: Intl.Collator
}

export interface ExtensionConfiguration {
  collation: {
    ignorePunctuation: boolean;
    caseFirst: CollationCaseFirst;
    numeric: boolean;
    locales: CollationLocale;
  };
}
export function getExtensionConfiguration(): ExtensionConfiguration {
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
