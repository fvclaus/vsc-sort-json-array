import * as vscode from 'vscode';
import { ExtensionApi } from '../../extension';
import { sleep } from './sleep';

export async function waitForQuickPick(extension: vscode.Extension<ExtensionApi>): Promise<void> {

  const start = new Date();
  while ((new Date().getTime() - start.getTime()) < 15000) {

    const isOpen = extension.exports.isQuickPickOpen();
    if (isOpen) {
      return;
    }
    await sleep(200);
  }

  throw new Error('QuickPick did not open');
}
