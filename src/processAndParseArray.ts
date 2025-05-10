import {FileExtension} from './fileExtension';
import {default as parseJsonArray, ParseResult} from './parser/parseArray';

function preprocess(arrayAsText: string, fileExtension: FileExtension): string {
  switch (fileExtension) {
    case FileExtension.JSONL: {
      return '[\n'+
        arrayAsText
          .split(/\r?\n/)
          // Add a trailing comma to all lines including a value
          .map(l => /^\s*[^/]/.test(l)? `${l},` : l)
          .join("\n")
        + "\n]"
        
    }
    default:
      return arrayAsText;
  }
}

export default function processAndParseArray(arrayAsText: string, fileExtension: FileExtension) : ParseResult {
  try {
    const parsedArray = parseJsonArray(preprocess(arrayAsText, fileExtension));

    if (fileExtension === FileExtension.JSONL) {
      if (parsedArray.allCommentTokens.length > 0) {
        throw new Error("Comments are not supported in JSONL files. Each line must be a valid JSON object.");
      }
    }
    return parsedArray;
  } catch (e) {
    throw new Error(`Cannot parse selection as JSON array. Reason: ${(e as Error).message}`);
  }
}
