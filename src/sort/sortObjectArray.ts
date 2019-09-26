import { SortOrder } from "./SortOrder";
import { genericSortFn } from "./genericSortFn";

function sortByProperty(a: any, b: any, property: string, sortOrder: SortOrder): number {
    return genericSortFn(sortOrder)(a[property], b[property]);
}

export function sortObjectArray(arrayToSort: any[], selectedProperties: string[], sortOrder: SortOrder): boolean {
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
