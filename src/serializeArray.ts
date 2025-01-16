import {FileExtension} from './fileExtension';
import { RangeFinder } from './findRange';
import { Range } from './parser/parseArray';
  
// TODO Too many parameters
export default function serializeArray(array: unknown[], fileExtension: FileExtension, text: string,
  positions: Range[], indexSymbol: symbol, tabSize?: number): string {
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
        if (typeof element === 'object' && element !== null && indexSymbol in element) {
          // TODO Typing?
          const index = (element as any)[indexSymbol]  as number;
          const text = rangeFinder.find(positions[index]);
          serializedArray.push(text);
        } else {
          // TODO We need to transport the information which quotes should be used
          serializedArray.push(String(element));
        }
      }
      // TODO Was it original on more than one line? -> Use newlines
      // TODO New line handling
      return "[\n" + serializedArray.join(",\n") + "\n]";
    }
  }
}
