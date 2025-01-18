export enum ArrayType {
    object,
    string,
    number
}
function determineType(item: unknown | undefined): ArrayType | undefined {
  if (item == null) {
    return undefined;
  }

  const itemType = typeof item;

  if (item instanceof String || itemType === 'string') {
    return ArrayType.string;
  } else if (itemType === 'object') {
    return ArrayType.object;
  } else if (itemType === 'number') {
    return ArrayType.number;
  } else {
    return undefined; 
  }
}
export function determineArrayType(array: unknown[]): ArrayType | undefined {
  if (array.length === 0) {
    return undefined;
  }
  return array
      .map(determineType)
      .reduce((arrayType, itemType) => arrayType === itemType? arrayType : undefined);
}
