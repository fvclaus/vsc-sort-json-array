import {FileExtension} from './fileExtension';
import {default as parseJsonArray, ParserConfig} from './parser/parseArray';

function applyPreFilter(array: string, fileExtension: FileExtension): string {
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

const fileExtensionToParserConfig: {[Key in FileExtension]: ParserConfig} =  {
  [FileExtension.JSON] : {doubleEscape: true},
  [FileExtension.JSONL]: {doubleEscape: true},
  [FileExtension.OTHER]: {doubleEscape: false}
}

export default function processAndParseArray(array: string, fileExtension: FileExtension) : unknown[] {
  try {
    return parseJsonArray(applyPreFilter(array, fileExtension), fileExtensionToParserConfig[fileExtension]);
  } catch (e) {
    throw new Error(`Cannot parse selection as JSON array. Reason: ${(e as Error).message}`);
  }
}
