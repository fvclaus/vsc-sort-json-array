
function applyPreFilter (array: string, fileExtension: string) {
    switch (fileExtension) {
        case "jsonl": {
            return "[" + 
            array
                .split('\n')
                .filter(element => element.trim())
                .join(',') + 
            "]"
        }
        default: 
            return array
    }
}

export default function parseArray(array: string, fileExtension: string) : any[] {    
    return JSON.parse(applyPreFilter(array, fileExtension));
}
