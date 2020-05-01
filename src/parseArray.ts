import { FileExtension } from "./fileExtension";

function applyPreFilter (array: string, fileExtension: FileExtension) {
    switch (fileExtension) {
        case FileExtension.JSONL: {
            return "[" + 
            array
                .split('\n')
                .filter(element => element.trim())
                .join(',') + 
            "]";
        }
        default: 
            return array;
    }
}

export default function parseArray(array: string, fileExtension: FileExtension) : any[] {    
    return JSON.parse(applyPreFilter(array, fileExtension));
}
