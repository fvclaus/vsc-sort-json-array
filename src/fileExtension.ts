export enum FileExtension {
    JSONL,
    JSON,
    OTHER
}

export namespace FileExtension {
    export function getFileExtension(filename: string): FileExtension {
        const fileSegments = filename.split('.');
        if (fileSegments.length > 0) {
            const fileExtension = fileSegments.pop()!.toLowerCase();
            switch(fileExtension) {
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

