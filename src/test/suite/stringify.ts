import { FileExtension } from "../../fileExtension";

function stringify(a: any) {
    return JSON.stringify(a, null, 2);
}

export default function stringifyArray(array: any[], fileExtension: FileExtension): string {
    switch (fileExtension) {
        case FileExtension.JSONL:
            return array
                .map(a => JSON.stringify(a))
                .join("\n");
        default:
            return stringify(array);
    }
}