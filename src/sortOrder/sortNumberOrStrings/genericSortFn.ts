import {SortConfiguration} from '../../extensionConfiguration';
import {SortOrder} from '../SortOrder';


export function genericSortFn(sortConfiguration: SortConfiguration): (a: unknown, b: unknown) => number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortFn: (a: any, b: any) => number = (a, b) => {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  };
  return sortConfiguration.order === SortOrder.ascending ? sortFn : (a, b) => -1 * sortFn(a, b);
}
