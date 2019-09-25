export enum ArrayType {
    object,
    string,
    number
}
function determineType(item: any) {
    const arrayTypeString = typeof item as keyof typeof ArrayType;

    return ArrayType[arrayTypeString];

}
export function determineArrayType(array: any[]): ArrayType | undefined {
    let arrayType: ArrayType | undefined;
    let i = 0;
    do {
        const item = array[i];
        const itemType = determineType(item);
        // null or undefined would need to be handled by every sort function. This is why we don't allow it here.
        const typeOfCurrentItemIsDifferent = itemType !== arrayType;
        const itemIsNullOrUndefined = (item === null || item === undefined);
        if (itemIsNullOrUndefined || typeOfCurrentItemIsDifferent) {
            return undefined;
        } else {
            arrayType = itemType;
        }
        i++;
    } while (arrayType !== undefined && i < array.length)
    
    return arrayType;
}