import * as vscode from 'vscode';
import { ExtensionApi } from '../../extension';

export async function waitForActiveExtension(): Promise<vscode.Extension<ExtensionApi>> {
  const ext = vscode.extensions.getExtension('fvclaus.sort-json-array');
  if (ext == null) {
    throw new Error("Did not find extension. This shouldn't happen");
  }

  if (!ext.isActive) {
    await ext.activate();
  }
  return ext;
}
