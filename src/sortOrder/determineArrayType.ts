export enum ArrayType {
    object,
    string,
    number
}
function determineType(item: any) {
    if (item === null || item === undefined) {
        return undefined;
    }
    const arrayTypeString = typeof item as keyof typeof ArrayType;

    return ArrayType[arrayTypeString];

}
export function determineArrayType(array: any[]): ArrayType | undefined { 
    if (array.length === 0) {
        return undefined;
    }
    return array
        .map(determineType)
        .reduce((arrayType, itemType) => arrayType === itemType? arrayType : undefined as any);
}