import {genericSortFn} from '../sortNumberOrStrings/genericSortFn';
import {GenericObject} from './GenericObject';
import {SortConfiguration} from '..';
import {stringSortFn} from '../sortNumberOrStrings/stringSortFn';


function sortByProperty(a: GenericObject, b: GenericObject, property: string, sortConfiguration: SortConfiguration): number {
  const aValue = a[property];
  const bValue = b[property];
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return stringSortFn(sortConfiguration)(aValue, bValue);
  }
  return genericSortFn(sortConfiguration)(aValue, bValue);
}

export function sortObjectArray(arrayToSort: GenericObject[], selectedProperties: string[], sortConfiguration: SortConfiguration): boolean {
  let sortIsDeterminstic = true;
  arrayToSort.sort((a, b) => {
    for (const selectedProperty of selectedProperties) {
      const order = sortByProperty(a, b, selectedProperty, sortConfiguration);
      if (order !== 0) {
        return order;
      }
    }
    sortIsDeterminstic = false;
    return 0;
  });
  return sortIsDeterminstic;
}
