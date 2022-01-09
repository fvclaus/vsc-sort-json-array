import {SortConfiguration} from '..';
import {SortOrder} from '../SortOrder';

export function stringSortFn(sortConfiguration: SortConfiguration): (a: string, b:string) => number {
  const sortFn = sortConfiguration.collator.compare;
  return sortConfiguration.order === SortOrder.ascending ? sortFn : (a, b) => -1 * sortFn(a, b);
}
