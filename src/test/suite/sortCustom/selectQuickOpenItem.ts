import * as vscode from 'vscode';
import nextTick from '../nextTick';

export async function selectQuickOpenItem(item: string): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.focusQuickOpen');
  await vscode.env.clipboard.writeText(item);
  await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
  await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
  await nextTick();
}
