import * as vscode from 'vscode';
import {openNewJsonDocument, closeActiveEditor} from '../textEditorUtils';
import * as path from 'path';
import * as fs from 'fs';
import {ExtensionApi} from '../../../extension';
import { waitForActiveExtension } from '../waitForActiveExtension';


export async function getExtensionApi(): Promise<ExtensionApi> {
  const packageJson : {[key: string]: unknown} = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../package.json')).toString());
  const extensionId = `${packageJson.publisher}.${packageJson.name}`;
  const extension = await waitForActiveExtension();
  try {
    // Open empty document. Otherwise we dependent on the current editor content of the previous test.
    // If the cursor position is inside and object array a Quickpick may appear and hang forever.
    await openNewJsonDocument('[1, 2, 3]');
    // Must not activate sortJsonCustom. It will show a Quickpick and hang forever
    await vscode.commands.executeCommand('extension.sortJsonArrayAscending');
  } catch (e) {
    console.log(`Error activating extension: ${e}`);
  }
  await closeActiveEditor();
  if (extension != null) {
    // If no command of this extension was executed before, .getExtension will return undefined.
    return extension.exports;
  } else {
    throw new Error(`Extension ${extensionId} is not defined!`);
  }
}

export async function getGlobalStoragePath(): Promise<string> {
  const extensionApi = await getExtensionApi();
  return extensionApi.getGlobalStoragePath();
}
