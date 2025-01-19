import { SupportedArrayValueType } from "./parser/parseArray";

export const indexSymbol = Symbol("index");


// eslint-disable-next-line @typescript-eslint/ban-types
export type WithIndex = (object | String) & {[indexSymbol]: number};


// eslint-disable-next-line @typescript-eslint/ban-types
export type WithIndexArray = (WithIndex | Exclude<SupportedArrayValueType, object | String | Number>)[];

export function addIndex (array: SupportedArrayValueType[]): WithIndexArray {

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
