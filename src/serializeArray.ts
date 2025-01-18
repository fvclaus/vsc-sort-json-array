import {FileExtension} from './fileExtension';
import { RangeFinder } from './findRange';
import { indexSymbol, WithIndexArray } from './indexArray';
import { Range } from './parser/parseArray';
  
// TODO Too many parameters
export default function serializeArray(array: WithIndexArray, fileExtension: FileExtension, text: string,
  positions: Range[]): string {
  switch (fileExtension) {
    case FileExtension.JSONL: {
      // TODO What about JSON?
      return array.map((element) => JSON.stringify(element))
          .join('\n');
    }
    default: {
      const rangeFinder = new RangeFinder(text);

      const serializedArray: string[] = [];
      for (const element of array) {
        if (element === null || element === undefined || typeof element === 'boolean' || typeof element === 'number') {
          serializedArray.push(String(element));
        } else {
          const index = element[indexSymbol]  as number;
          const text = rangeFinder.find(positions[index]);
          serializedArray.push(text);
        }
      }
      if (text.includes("\n")) {
        return "[\n" + serializedArray.join(",\n") + "\n]";
      } else {
        return "[" + serializedArray.join(", ") + "]";
      }
    }
  }
}
