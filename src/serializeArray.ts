export default function serializeArray(array: any[], fileExtension: string, tabSize?: number) {
    switch (fileExtension) {
        case "jsonl": {
            return array.map(element => JSON.stringify(element))
                .join('\n')
        }
        default: 
            return JSON.stringify(array, null, tabSize)
    }
}