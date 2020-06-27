import {FileExtension} from './fileExtension';

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
  let object;
  try {
    object = JSON.parse(applyPreFilter(array, fileExtension));
  } catch (e) {
    throw new Error(`Cannot parse selection as JSON. Reason: ${e}`);
  }
  if (object.constructor === Array) {
    return object;
  } else {
    throw new Error(`Selection is a ${object.constructor} not an array.`);
  }
}
