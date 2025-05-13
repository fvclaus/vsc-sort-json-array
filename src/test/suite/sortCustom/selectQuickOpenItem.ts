import * as vscode from 'vscode';
import nextTick from '../nextTick';

export async function selectQuickOpenItems(...items: string[]): Promise<void> {
  for (const item of items) {
    await vscode.env.clipboard.writeText(item);
    await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
    await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
    await nextTick();
  }
}
