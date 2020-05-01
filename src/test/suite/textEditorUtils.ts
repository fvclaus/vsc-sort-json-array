import * as vscode from 'vscode';
import * as temp from 'temp';
import * as fs from 'fs';
import nextTick from './nextTick';
import { TextEditor } from 'vscode';

const window = vscode.window;

const ZERO_POSITION = new vscode.Position(0, 0);

export async function replaceTextInCurrentEditor(content: string) {
    const editor = (vscode.window.activeTextEditor as vscode.TextEditor);
    return new Promise((resolve) => {
        editor.edit(edit => {
            const all = new vscode.Range(ZERO_POSITION, new vscode.Position(editor.document.lineCount + 1, 0));
            edit.replace(all, content);
            resolve();
        });
    });
}

export async function closeActiveEditor() {
    const editor = vscode.window.activeTextEditor as TextEditor;
    // Editor might be closed already after the last test.
    if (editor) {
        const document = editor.document;
        const uri = document.uri;
        await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor');
        if (fs.existsSync(uri.path)) {
            fs.unlink(uri.path, (err) => {
                if (err) {
                    console.info(`Cannot delete file ${uri.path}: ${err}`);
                }
            });
        }
        await nextTick();
    }
}

export async function openNewJsonDocument(text: string) {
    const tempFile = temp.openSync({
        suffix: '.json'
    });
    fs.openSync(tempFile.path, 'a+');

    const document = await vscode.workspace.openTextDocument(tempFile.path);
    const editor = await window.showTextDocument(document);
    // Mark file as dirty to bypass preview mode that would open the sort module in the current tab.
    await replaceTextInCurrentEditor(text);
    editor.selection = new vscode.Selection(ZERO_POSITION, ZERO_POSITION);
    await nextTick();
    return {
        document,
        editor
    };
}