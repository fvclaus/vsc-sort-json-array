import * as vscode from 'vscode';
import * as temp from 'temp';
import * as fs from 'fs';
import nextTick from './nextTick';
import {TextEditor} from 'vscode';

const window = vscode.window;

const ZERO_POSITION = new vscode.Position(0, 0);

export function replaceTextInCurrentEditor(content: string): Promise<void> {
  const editor = (vscode.window.activeTextEditor as vscode.TextEditor);
  return new Promise((resolve) => {
    editor.edit((edit) => {
      console.log(`Replacing in ${editor.document.fileName}`);
      const all = new vscode.Range(ZERO_POSITION, new vscode.Position(editor.document.lineCount + 1, 0));
      edit.replace(all, content);
      nextTick().then(resolve);
    });
  });
}

export async function closeActiveEditor(): Promise<void> {
  const editor = vscode.window.activeTextEditor as TextEditor;
  // Editor might be closed already after the last test.
  if (editor != null) {
    const document = editor.document;
    const uri = document.uri;
    await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor');
    if (fs.existsSync(uri.path)) {
      fs.unlink(uri.path, (err) => {
        if (err != null) {
          console.info(`Cannot delete file ${uri.path}: ${err}`);
        }
      });
    }
    await nextTick();
  }
}

export async function openNewJsonDocument(text: string): Promise<{document: vscode.TextDocument, editor: TextEditor}> {
  const tempFile = temp.openSync({
    suffix: '.json',
  });
  fs.openSync(tempFile.path, 'a+');

  const document = await vscode.workspace.openTextDocument(tempFile.path);
  const editor = await window.showTextDocument(document);
  // Mark file as dirty to bypass preview mode that would open the sort module in the current tab.
  await replaceTextInCurrentEditor(text);
  editor.selection = new vscode.Selection(ZERO_POSITION, ZERO_POSITION);
  return {
    document,
    editor,
  };
}
