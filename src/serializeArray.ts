import {FileExtension} from './fileExtension';

export default function serializeArray(array: unknown[], fileExtension: FileExtension, tabSize?: number): string {
  switch (fileExtension) {
    case FileExtension.JSONL: {
      return array.map((element) => JSON.stringify(element))
          .join('\n');
    }
    default:
      return JSON.stringify(array, null, tabSize);
  }
}
