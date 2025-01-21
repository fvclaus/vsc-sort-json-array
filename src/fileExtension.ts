export enum FileExtension {
    JSONL,
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
          default:
            return FileExtension.OTHER;
        }
      } else {
        return FileExtension.OTHER;
      }
    }
}

