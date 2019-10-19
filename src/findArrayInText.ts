const { parse } = require('acorn');
const { findNodeAround, findNodeAfter } = require('acorn-walk');

const BRACKETS_REGEX = /[[\]]/g;

export type FoundArray = {
  text: string,
  start: number,
  end: number 
};

/**
 * Will find a enclosing pair of [] around the given `offset` in `text`.
 * 
 * @param text to parse
 * @param offset to parse around.
 * @returns FoundArray or undefined if nothing was found
 */
export function findArrayInText(text: string, offset: number) : FoundArray|undefined {
  const root = parse(text);
  let array = findNodeAround(root, offset, 'ArrayExpression');
  if (array) {
    const { start, end } = array.node;
    text = text.substring(start, end);
    return {
      text, start, end
    };
  }
}
