import {FileExtension} from './fileExtension';
import {default as parseJsonArray, Range, SupportedArrayValueType} from './parser/parseArray';

function preprocess(arrayAsText: string, fileExtension: FileExtension): string {
  switch (fileExtension) {
    case FileExtension.JSONL: {
      return '[\n'+
        arrayAsText
          .split("\n")
          // Add a trailing comma to all lines including a value
          // TODO Test
          .map(l => /^\s*[^/]/.test(l)? `${l},` : l)
          .join("\n")
        + "\n]"
        
    }
    default:
      return arrayAsText;
  }
}

function postprocess(parsedArray: SupportedArrayValueType[], positions: Range[], fileExtension: FileExtension): [SupportedArrayValueType[], Range[]] {

  switch(fileExtension) {
    case FileExtension.JSONL : {
      return [parsedArray, positions.map(position => {
        const {start: [startLine, startColumn], end: [endLine, endColumn]} = {start: position.start, end: position.end};
        return new Range([startLine - 1, startColumn], [endLine - 1, endColumn]);
      })]
    }
    default: {
      return [parsedArray, positions];
    }
  }

}

export default function processAndParseArray(arrayAsText: string, fileExtension: FileExtension) : [SupportedArrayValueType[], Range[]] {
  try {
    const [parsedArray, positions] = parseJsonArray(preprocess(arrayAsText, fileExtension));
    return postprocess(parsedArray, positions, fileExtension);
  } catch (e) {
    throw new Error(`Cannot parse selection as JSON array. Reason: ${(e as Error).message}`);
  }
}
