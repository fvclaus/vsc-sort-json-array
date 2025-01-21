import {FileExtension} from './fileExtension';
import {default as parseJsonArray, ArrayItem} from './parser/parseArray';

function preprocess(arrayAsText: string, fileExtension: FileExtension): string {
  switch (fileExtension) {
    case FileExtension.JSONL: {
      return '[\n'+
        arrayAsText
          .split("\n")
          // Add a trailing comma to all lines including a value
          .map(l => /^\s*[^/]/.test(l)? `${l},` : l)
          .join("\n")
        + "\n]"
        
    }
    default:
      return arrayAsText;
  }
}

export default function processAndParseArray(arrayAsText: string, fileExtension: FileExtension) : ArrayItem[] {
  try {
    const parsedArray = parseJsonArray(preprocess(arrayAsText, fileExtension));
    return parsedArray;
  } catch (e) {
    throw new Error(`Cannot parse selection as JSON array. Reason: ${(e as Error).message}`);
  }
}
