import {sortObjectArray} from './sortObjectArray';

import * as vscode from 'vscode';

import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import {findCommonProperties} from './findCommonProperties';
import {GenericObject} from './GenericObject';
import {SortConfiguration} from '..';

async function pickPropertiesIfNecessary(window: typeof Window, selectedProperties: string[], quickPickItems: QuickPickItem[]):
 Promise<vscode.QuickPickItem | undefined> {
  const remainingQuickPickItems = quickPickItems.filter((item) => selectedProperties.indexOf(item.label) === -1);
  // Don't show picker if only one item is remaining.
  if (remainingQuickPickItems.length > 1) {
    return window.showQuickPick(remainingQuickPickItems, {
      canPickMany: false,
      placeHolder: selectedProperties.length === 0 ?
        'Pick property from list to define sort order.' :
         'Sorting cannot produce determinable result. Please pick another property.',
    });
  } else {
    return remainingQuickPickItems[0];
  }
}
async function pickUntilSortIsDeterministic(
    window: typeof Window, selectedProperties: string[], quickPickItems: QuickPickItem[], arrayToSort: GenericObject[], sortConfiguration: SortConfiguration):
     Promise<GenericObject[] | undefined> {
  const selectedItem = await pickPropertiesIfNecessary(window, selectedProperties, quickPickItems);
  // undefined if user uses ESC
  if (selectedItem != null) {
    const selectedProperty = selectedItem.label;
    selectedProperties.push(selectedProperty);
    const sortIsDeterminstic = sortObjectArray(arrayToSort, selectedProperties, sortConfiguration);
    // The sort is deterministic or the array cannot be sorted in a determinable way.
    if (sortIsDeterminstic || selectedProperties.length === quickPickItems.length) {
      return arrayToSort;
    } else {
      return await pickUntilSortIsDeterministic(window, selectedProperties, quickPickItems, arrayToSort, sortConfiguration);
    }
  }
}
export async function sortObjects(window: typeof Window, array: GenericObject[], sortConfiguration: SortConfiguration): Promise<GenericObject[] | undefined> {
  const commonProperties = findCommonProperties(array);
  const quickPickItems = Array.from(commonProperties)
      .map((property) => ({
        label: property,
      } as QuickPickItem));
    // Ensure consistent sorting.
  quickPickItems.sort();
  if (quickPickItems.length === 0) {
    throw new Error(`There are no properties all objects of this array have in common.`);
  } else {
    return await pickUntilSortIsDeterministic(window, [], quickPickItems, array.slice(0), sortConfiguration);
  }
}
