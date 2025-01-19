import {FileExtension} from './fileExtension';
import { RangeFinder } from './findRange';
import { indexSymbol, WithIndexArray } from './indexArray';
import { Range } from './parser/parseArray';

enum SerializationFormat {
  SAME_LINE,
  THREE_LINES,
  MORE_THAN_THREE_LINES
}

function determineSerializationFormat(numberOfLines: number): SerializationFormat {
  if (numberOfLines === 1) {
    return SerializationFormat.SAME_LINE
  } else if (numberOfLines === 2 || numberOfLines === 3) {
    return SerializationFormat.THREE_LINES;
  } else {
    return SerializationFormat.MORE_THAN_THREE_LINES;
  }
}
  
// TODO Too many parameters
export default function serializeArray(array: WithIndexArray, fileExtension: FileExtension, text: string,
  positions: Range[], {indentLevel, newIndent}: {indentLevel: number, newIndent: string}): string {
  switch (fileExtension) {
    case FileExtension.JSONL: {
      // TODO What about JSON?
      return array.map((element) => JSON.stringify(element))
          .join('\n');
    }
    default: {
      const rangeFinder = new RangeFinder(text);
      const serializationFormat = determineSerializationFormat(rangeFinder.numberOfLines);

      const serializedArray: string[] = [];
      for (const element of array) {
        if (element === null || element === undefined || typeof element === 'boolean') {
          serializedArray.push(String(element));
        } else {
          const index = element[indexSymbol]  as number;
          let text = rangeFinder.find(positions[index]);
          // Only preserve leading space if we write out more than three lines
          if (serializationFormat !== SerializationFormat.MORE_THAN_THREE_LINES) {
            text = text.trim();
          }
          serializedArray.push(text);
        }
      }

      switch (serializationFormat) {
        case SerializationFormat.MORE_THAN_THREE_LINES: {
          return "[\n" + serializedArray.join(",\n") + "\n]";
        }
        case SerializationFormat.SAME_LINE: {
          return "[" + serializedArray.join(", ") + "]";
        }
        case SerializationFormat.THREE_LINES: {
          return "[\n" + `${newIndent.repeat(indentLevel + 1)}${serializedArray.join(", ")}` + `\n${newIndent.repeat(indentLevel)}]`;
        }
      }
    }
  }
}
