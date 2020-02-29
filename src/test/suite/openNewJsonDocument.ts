import * as vscode from 'vscode'
import * as temp from 'temp';
import * as fs from 'fs';
import nextTick from '../nextTick';

const window = vscode.window;

const ZERO_POSITION = new vscode.Position(0, 0)

export async function replaceTextInCurrentEditor(content: string) {
    const editor = (vscode.window.activeTextEditor as vscode.TextEditor);
    return new Promise((resolve) => {
        editor.edit(edit => {
            const all = new vscode.Range(ZERO_POSITION, new vscode.Position(editor.document.lineCount + 1, 0));
            edit.replace(all, content);
            resolve();
        })
    })
}

export default async function openNewJsonDocument(text: string) {
    const tempFile = temp.openSync({
        suffix: '.json'
    });
    fs.openSync(tempFile.path, 'a+');

    const document = await vscode.workspace.openTextDocument(tempFile.path);
    const editor = await window.showTextDocument(document);
    // Mark file as dirty to bypass preview mode that would open the sort module in the current tab.
    await replaceTextInCurrentEditor(text);
    editor.selection = new vscode.Selection(ZERO_POSITION, ZERO_POSITION)
    await nextTick()
    return {
        document,
        editor
    }
}