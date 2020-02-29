import * as vscode from 'vscode'
import openNewJsonDocument from "../openNewJsonDocument";
import * as path from 'path';
import * as fs from 'fs';


export async function getExtensionApi() {
    const packageJson : any = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../package.json')).toString())
    const extensionId = `${packageJson.publisher}.${packageJson.name}`;
    // Activate extension
    try {
        // Open empty document. Otherwise we dependent on the current editor content of the previous test.
        // If the cursor position is inside and object array a Quickpick may appear and hang forever.
        await openNewJsonDocument('')
        // Must not activate sortJsonCustom. It will show a Quickpick and hang forever
        await vscode.commands.executeCommand('extension.sortJsonArrayAscending');
    } catch (e) {
        console.log(`Error activating extension: ${e}`)
    }
    // If no command of this extension was executed before, .getExtension will return undefined.
    return vscode.extensions.getExtension(extensionId)!.exports;
}

export async function getGlobalStoragePath() {
    const extensionApi = await getExtensionApi()
    return extensionApi.getGlobalStoragePath();
}