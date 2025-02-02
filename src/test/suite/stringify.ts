import {FileExtension} from '../../fileExtension';

export default function stringifyArray(array: unknown[], fileExtension: FileExtension): string {
  switch (fileExtension) {
    case FileExtension.JSONL:
      return array
          .map((a) => JSON.stringify(a))
          .join('\n');
    default:
      return JSON.stringify(array, null, 2);
  }
}
