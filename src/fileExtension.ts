export enum FileExtension {
    JSONL,
    JSON,
    OTHER
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace FileExtension {
    export function getFileExtension(filename: string): FileExtension {
      const fileSegments = filename.split('.');
      if (fileSegments.length > 0) {
        const fileExtension = fileSegments[fileSegments.length -1].toLowerCase();
        switch (fileExtension) {
          case 'jsonl':
            return FileExtension.JSONL;
          case 'json':
            return FileExtension.JSON;
          default:
            return FileExtension.OTHER;
        }
      } else {
        return FileExtension.JSON;
      }
    }
}

