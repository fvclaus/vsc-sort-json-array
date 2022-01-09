export enum ArrayType {
    object,
    string,
    number
}
function determineType(item: unknown | undefined): ArrayType | undefined {
  if (item == null) {
    return undefined;
  }
  const arrayTypeString = typeof item as keyof typeof ArrayType;

  return ArrayType[arrayTypeString];
}
export function determineArrayType(array: unknown[]): ArrayType | undefined {
  if (array.length === 0) {
    return undefined;
  }
  return array
      .map(determineType)
      .reduce((arrayType, itemType) => arrayType === itemType? arrayType : undefined);
}
