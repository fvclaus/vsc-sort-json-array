import { Range } from "./parser/parseArray";

// TODO Naming
export class RangeFinder {
    private lines: string[];
    constructor(text: string) {
        this.lines = text.split("\n");
    }

    public find(range: Range): string {
        const {start: [startLine, startColumn], end: [endLine, endColumn]} = {start: range.start.map(i => i - 1), end: range.end.map(i => i - 1)};
        const prefix = this.lines[startLine].substring(0, startColumn);
        const onlyPrecedingWhitespace = prefix.trim().length == 0;
        const isOnSameLine = startLine === endLine;
        if (isOnSameLine) {
            return this.lines[startLine].substring(onlyPrecedingWhitespace? 0 :  startColumn, endColumn + 1);
        }

        const text: string[] = [];
        text.push(this.lines[startLine].substring(onlyPrecedingWhitespace? 0 : startColumn));

        for (let i = startLine + 1; i < endLine; i++) {
            text.push(this.lines[i]);
        }

        if (endLine > startLine) {
            // Inclusive end
            text.push(this.lines[endLine].substring(0, (endColumn + 1)));
        }
        return text.join("\n");
    }
}
