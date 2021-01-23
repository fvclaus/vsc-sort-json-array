import {FileExtension} from './fileExtension';
import {default as parseJsonArray} from './parser/parseArray';

function applyPreFilter(array: string, fileExtension: FileExtension) {
  switch (fileExtension) {
    case FileExtension.JSONL: {
      return '[' +
            array
                .split('\n')
                .filter((element) => element.trim())
                .join(',') +
            ']';
    }
    default:
      return array;
  }
}

export default function parseArray(array: string, fileExtension: FileExtension) : unknown[] {
  try {
    return parseJsonArray(applyPreFilter(array, fileExtension));
  } catch (e) {
    throw new Error(`Cannot parse selection as JSON array. Reason: ${e.message}`);
  }
}
