import {SortOrder} from '../SortOrder';
import {genericSortFn} from '../sortNumberOrStrings/genericSortFn';
import {GenericObject} from './GenericObject';


function sortByProperty(a: GenericObject, b: GenericObject, property: string, sortOrder: SortOrder): number {
  return genericSortFn(sortOrder)(a[property], b[property]);
}

export function sortObjectArray(arrayToSort: GenericObject[], selectedProperties: string[], sortOrder: SortOrder): boolean {
  let sortIsDeterminstic = true;
  arrayToSort.sort((a, b) => {
    for (const selectedProperty of selectedProperties) {
      const order = sortByProperty(a, b, selectedProperty, sortOrder);
      if (order !== 0) {
        return order;
      }
    }
    sortIsDeterminstic = false;
    return 0;
  });
  return sortIsDeterminstic;
}
