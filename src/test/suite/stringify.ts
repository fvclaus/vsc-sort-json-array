export default function stringify(something: any): string {
    return JSON.stringify(something, null, 2)
}