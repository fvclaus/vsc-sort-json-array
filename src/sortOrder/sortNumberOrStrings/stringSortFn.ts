import {SortConfiguration} from '../../extensionConfiguration';
import {SortOrder} from '../SortOrder';

// eslint-disable-next-line @typescript-eslint/ban-types
export function stringSortFn(sortConfiguration: SortConfiguration): (a: String, b: String) => number {
  const sortFn = sortConfiguration.collator.compare;
  return sortConfiguration.order === SortOrder.ascending ? (a, b) => sortFn(a.valueOf(), b.valueOf()) : (a, b) => -1 * sortFn(a.valueOf(), b.valueOf());
}
