import * as vscode from 'vscode';
import nextTick from '../nextTick';
import { waitForActiveExtension } from '../waitForActiveExtension';

export async function selectQuickOpenItems(config: { items: string[]; targetExtension: boolean }): Promise<void> {
  const { items, targetExtension } = {...config };

  async function shouldFocusQuickOpen(): Promise<boolean> {
    if (targetExtension) {
      const ext = await waitForActiveExtension();
      // Don't focus again if it is already open
      return ext.exports.isQuickPickOpen();
    }
    return true;
  }
  
  if (!await shouldFocusQuickOpen()) {
    await vscode.commands.executeCommand('workbench.action.focusQuickOpen');
  }

  for (const item of items) {
    await vscode.env.clipboard.writeText(item);
    await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
    await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
    await nextTick();
  }
}
