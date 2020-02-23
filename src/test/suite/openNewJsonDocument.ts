import * as vscode from 'vscode'
import * as temp from 'temp';
import * as fs from 'fs';
import nextTick from '../nextTick';

const window = vscode.window;

const ZERO_POSITION = new vscode.Position(0, 0)

async function insertText(editor: vscode.TextEditor, content: string) {
    return new Promise((resolve) => {
        editor.edit(edit => {
            edit.replace(new vscode.Range(ZERO_POSITION, ZERO_POSITION), content);
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
    await insertText(editor, text);
    editor.selection = new vscode.Selection(ZERO_POSITION, ZERO_POSITION)
    await nextTick()
    return {
        document,
        editor
    }
}