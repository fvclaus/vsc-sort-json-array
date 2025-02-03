import * as vscode from "vscode";

export const QUICK_PICK_STATE_NAME = 'isQuickPickOpen';

export async function showQuickPick<T extends vscode.QuickPickItem>(extensionContext: vscode.ExtensionContext, quickPick: vscode.QuickPick<T>):
    Promise<vscode.QuickPickItem | undefined> {
    quickPick.show();
    await extensionContext.workspaceState.update(QUICK_PICK_STATE_NAME, true);

    return new Promise<vscode.QuickPickItem | undefined>((resolve) => {
      quickPick.onDidAccept(async () => {
        const selectedItem = quickPick.selectedItems[0];
        quickPick.hide();
        await extensionContext.workspaceState.update(QUICK_PICK_STATE_NAME, false);
        resolve(selectedItem);
      });
      quickPick.onDidHide(async () => {
        await extensionContext.workspaceState.update(QUICK_PICK_STATE_NAME, false);
        resolve(undefined);
      });
    });
}

export function isQuickPickOpen(extensionContext: vscode.ExtensionContext): boolean {
    return extensionContext.workspaceState.get(QUICK_PICK_STATE_NAME) as boolean || false;
}