export const indexSymbol = Symbol("index");


export type WithIndex = (object | string) & {[indexSymbol]: number};


export type WithIndexArray = (WithIndex | number | null | undefined | boolean)[];

export function addIndex (array: unknown[]): WithIndexArray {

  return array.map((el, i) => {
    if (el !== null && typeof el === 'object') {
      // Must not use spread operator, because this will kill String objects
      (el as WithIndex)[indexSymbol] = i;
      return el as WithIndex;
    } else if (el === null || el == undefined || typeof el === "boolean") {
      // TODO
      // throw new Error(`Cannot assign index to non-object: ${typeof el}`);
      return el;
    } else {
      throw new Error(`Unexpected type ${typeof el}`);
    }
  }) as WithIndexArray;

}
