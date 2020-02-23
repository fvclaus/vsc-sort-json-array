import * as vscode from 'vscode';

// I did not find this in the public API
export interface SelectionRange {
	/**
	 * The [range](#Range) of this selection range.
	 */
	range: vscode.Range;

	/**
	 * The parent selection range containing this range. Therefore `parent.range` must contain `this.range`.
	 */
	parent?: SelectionRange;
}

export async function searchEnclosingArray(document: vscode.TextDocument, selection: vscode.Selection): Promise<vscode.Range> {
    const selectionRanges: SelectionRange[] = await vscode.commands.executeCommand('vscode.executeSelectionRangeProvider', document.uri, [selection.active]) as SelectionRange[]
    let current: SelectionRange | undefined = selectionRanges[0]
    while (current !== undefined) {
        const text = document.getText(current.range)
        if (text[0] === '[' && text[text.length - 1] === ']') {
            return new vscode.Range(current.range.start, current.range.end)
        }
        current = current.parent
    }
    return selection
}