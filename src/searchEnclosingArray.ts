import * as vscode from 'vscode';
import { FileExtension } from './fileExtension';

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

function selectAll(document: vscode.TextDocument) {
    return new vscode.Range(new vscode.Position(0, 0), document.lineAt(document.lineCount - 1).range.end);
}

async function selectArray(document: vscode.TextDocument, selection: vscode.Selection): Promise<vscode.Range> {
    const selectionRanges: SelectionRange[] = await vscode.commands.executeCommand('vscode.executeSelectionRangeProvider', document.uri, [selection.active]) as SelectionRange[];
    let current: SelectionRange | undefined = selectionRanges[0];
    while (current !== undefined) {
        const text = document.getText(current.range);
        if (text[0] === '[' && text[text.length - 1] === ']') {
            return new vscode.Range(current.range.start, current.range.end);
        }
        current = current.parent;
    }
    return selection;

}

function doesVersionSupportSelectionRangeProvider() {
    const [major, minor] = vscode.version.split(".").map(versionFragment => parseInt(versionFragment, 10));
    return major >=1 && minor >= 44;
}

export async function searchEnclosingArray(document: vscode.TextDocument, activeSelection: vscode.Selection, fileExtension: FileExtension): Promise<vscode.Range> {
    if (!doesVersionSupportSelectionRangeProvider()) {
        throw new Error("Auto detection does not work in versions < 1.44, due to a bug in the vscode API. " +
        "Unfortunately, I forgot to increment the required vscode runtime when I published the auto detect feature. " + 
        "You can either upgrade your vscode or manually select the array.");
    }
    let selection: vscode.Range;
    switch (fileExtension) {
        case FileExtension.JSONL: 
            selection =  selectAll(document);
            break;
        default:
            selection = await selectArray(document, activeSelection);
            break;
    }
    if (selection.isEmpty) {
        throw new Error('No enclosing array could be found!');
    }
    return selection;
}