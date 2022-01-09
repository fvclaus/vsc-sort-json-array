import {FileExtension} from '../../fileExtension';

function stringify(a: unknown): string {
  return JSON.stringify(a, null, 2);
}

export default function stringifyArray(array: unknown[], fileExtension: FileExtension): string {
  switch (fileExtension) {
    case FileExtension.JSONL:
      return array
          .map((a) => JSON.stringify(a))
          .join('\n');
    default:
      return stringify(array);
  }
}
