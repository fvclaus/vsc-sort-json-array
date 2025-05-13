import {sortObjectArray} from './sortObjectArray';

import * as vscode from 'vscode';

import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import {findCommonProperties} from './findCommonProperties';
import {GenericObject} from './GenericObject';
import {SortConfiguration} from '..';
import {showQuickPick} from '../../showQuickPick';

async function pickPropertiesIfNecessary(extensionContext: vscode.ExtensionContext, window: typeof Window, 
  selectedProperties: string[], quickPickItems: QuickPickItem[]):
 Promise<vscode.QuickPickItem | undefined> {
  const remainingQuickPickItems = quickPickItems.filter((item) => selectedProperties.indexOf(item.label) === -1);
  // Don't show picker if only one item is remaining.
  if (remainingQuickPickItems.length > 1) {
    const quickPick = window.createQuickPick();
    quickPick.title = selectedProperties.length === 0 ? 'Pick property from list to define sort order' :
      `Pick an additional property to produce a deterministic sort`;

    if (selectedProperties.length > 0) {
      quickPick.placeholder = "There are array items with the same value for " +
        selectedProperties.map(p => `.${p}`).join(',');
    }
    quickPick.items = remainingQuickPickItems;
    quickPick.canSelectMany = false;
    return showQuickPick(extensionContext, quickPick);
  } else {
    return remainingQuickPickItems[0];
  }
}
async function pickUntilSortIsDeterministic(
    extensionContext: vscode.ExtensionContext, window: typeof Window, selectedProperties: string[], 
    quickPickItems: QuickPickItem[], arrayToSort: GenericObject[], sortConfiguration: SortConfiguration):
     Promise<GenericObject[] | undefined> {
  const selectedItem = await pickPropertiesIfNecessary(extensionContext, window, selectedProperties, quickPickItems);
  // undefined if user uses ESC
  if (selectedItem != null) {
    const selectedProperty = selectedItem.label;
    selectedProperties.push(selectedProperty);
    const sortIsDeterministic = sortObjectArray(arrayToSort, selectedProperties, sortConfiguration);
    // The sort is deterministic or the array cannot be sorted in a determinable way.
    if (sortIsDeterministic || selectedProperties.length === quickPickItems.length) {
      return arrayToSort;
    } else {
      return await pickUntilSortIsDeterministic(extensionContext, window, selectedProperties, quickPickItems, arrayToSort, sortConfiguration);
    }
  }
}
export async function sortObjects(extensionContext: vscode.ExtensionContext, window: typeof Window, 
  array: GenericObject[], sortConfiguration: SortConfiguration): Promise<GenericObject[] | undefined> {
  const commonProperties = findCommonProperties(array);
  const quickPickItems = Array.from(commonProperties)
      .map((property) => ({
        label: property,
      } as QuickPickItem));
    // Ensure consistent sorting.
  quickPickItems.sort();
  if (process.env.FVCLAUS_SORT_JSON_ARRAY_DEBUG === 'true') {
    console.log(`Sorting ${JSON.stringify(array, null, 2)}`);
  }
  if (quickPickItems.length === 0) {
    throw new Error(`There are no properties all objects of this array have in common.`);
  } else {
    return await pickUntilSortIsDeterministic(extensionContext, window, [], quickPickItems, array.slice(0), sortConfiguration);
  }
}
