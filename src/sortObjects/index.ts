import { sortObjectArray } from './sortObjectArray';
import { SortOrder } from '../SortOrder';

import * as vscode from 'vscode';

import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import { findCommonProperties } from './findCommonProperties';

function pickPropertiesIfNecessary(window: typeof Window, selectedProperties: string[], quickPickItems: QuickPickItem[]): Thenable<vscode.QuickPickItem | undefined> {
    const remainingQuickPickItems = quickPickItems.filter(item => selectedProperties.indexOf(item.label) === -1);
    // Don't show picker if only one item is remaining.
    if (remainingQuickPickItems.length > 1) {
        return window.showQuickPick(remainingQuickPickItems, {
            canPickMany: false,
            placeHolder: selectedProperties.length === 0 ? 'Pick property from list to define sort order.' : 'Sorting cannot produce determinable result. Please pick another property.'
        });
    }
    else {
        return Promise.resolve(remainingQuickPickItems[0]);
    }
}
function pickUntilSortIsDeterministic<E>(window: typeof Window, selectedProperties: string[], quickPickItems: QuickPickItem[], arrayToSort: E[], sortOrder: SortOrder): Promise<E[]> {
    return new Promise((resolve) => {
        pickPropertiesIfNecessary(window, selectedProperties, quickPickItems)
            .then(selectedItem => {
                // undefined if user uses ESC
                if (selectedItem) {
                    const selectedProperty = selectedItem.label;
                    selectedProperties.push(selectedProperty);
                    let sortIsDeterminstic = sortObjectArray(arrayToSort, selectedProperties, sortOrder);
                    // The sort is deterministic or the array cannot be sorted in a determinable way.
                    if (sortIsDeterminstic || selectedProperties.length === quickPickItems.length) {
                        resolve(arrayToSort);
                    }
                    else {
                        pickUntilSortIsDeterministic(window, selectedProperties, quickPickItems, arrayToSort, sortOrder)
                            .then(arrayToSort => resolve(arrayToSort));
                    }
                }
            });
    });
}
export function sortObjects(window: typeof Window, array: any[], sortOrder: SortOrder): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const commonProperties = findCommonProperties(array);
        const quickPickItems = Array.from(commonProperties)
            .map(property => ({
                label: property
            } as QuickPickItem));
        // Ensure consistent sorting.
        quickPickItems.sort();
        if (quickPickItems.length === 0) {
            reject(`There are no properties all objects of this array have in common.`);
        }
        else {
            pickUntilSortIsDeterministic(window, [], quickPickItems, array.slice(0), sortOrder)
                .then(resolve);
        }
    });
}
