import { SortOrder } from '../SortOrder';


export function genericSortFn(sortOrder: SortOrder): (a: any, b: any) => number {
    const sortFn: (a: any, b: any) => number = (a, b) => {
        if (a < b) {
            return -1;
        }
        else if (a > b) {
            return 1;
        }
        else {
            return 0;
        }
    };
    return sortOrder === SortOrder.ascending ? sortFn : (a: any, b: any) => -1 * sortFn(a, b);
}
