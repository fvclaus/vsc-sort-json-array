'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os'; // Import os module
import * as vscode from 'vscode';
import { window, TextEditor } from 'vscode';
import {sortCustom} from './sortCustom';
import { getExtensionConfiguration } from './extensionConfiguration'; // Import getExtensionConfiguration
import {sortAscending, sortDescending} from './sortOrder';
import {searchEnclosingArray} from './searchEnclosingArray';
import processAndParseArray from './processAndParseArray';
import serializeArray from './serializeArray';
import {FileExtension} from './fileExtension';
import { ArrayItem, convertToLiteralValues } from './parser/parseArray';
import { isQuickPickOpen } from './showQuickPick';


function calculateIndentOfStartingLine(editor: vscode.TextEditor, selection: vscode.Range): {indentLevel: number, newIndent: string } {
  const options = editor.options;
  
  const startingLine = editor.document.lineAt(selection.start.line);
  const match = /^(\s)*/.exec(startingLine.text);
  let indentLevel = 0;
  // indentSize was released in 1.74: https://code.visualstudio.com/updates/v1_74#_new-indent-size-setting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indentOrTabSize = 'indentSize' in options? (options as any).indentSize : options.tabSize;
  if (match !== null) {
    // .replaceAll not available in 1.44.0
    const indent = match[0].replace(/\t/g, " ".repeat(indentOrTabSize));
    indentLevel = Math.ceil(indent.length / indentOrTabSize);
  }

  const indentType = options.insertSpaces === false? '\t' : ' '.repeat(indentOrTabSize);
  return {indentLevel, newIndent: indentType};
}

// Return value was implemented to improve testability.
const fail = async (extensionContext: vscode.ExtensionContext, error: string | Error, arrayString?: string): Promise<undefined> => {
  console.error(error);
  const errorMessage = typeof error === 'string' ? error : error.message;
  const openIssueButton = 'Open GitHub Issue';

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  window.showErrorMessage(errorMessage, openIssueButton).then(async selection => {
    if (selection === openIssueButton) {
      let issueBaseUrl: string | undefined;
      let extensionVersion: string | undefined;

      try {
        const packageJsonPath = path.join(extensionContext.extensionPath, 'package.json');
        const packageJsonContent = await fs.promises.readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);
        if (typeof packageJson.bugs === 'object' && packageJson.bugs !== null && typeof packageJson.bugs.url === 'string' 
            && typeof packageJson.version === 'string') {
          issueBaseUrl = packageJson.bugs.url as string;
          extensionVersion = packageJson.version;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          vscode.window.showErrorMessage('Could not find bugs.url in package.json');
          return;
        }
      } catch (readError) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        vscode.window.showErrorMessage(
          `Failed to get GitHub issue URL from package.json: ${readError instanceof Error ? readError.message : readError}`
        );
        return;
      }

      const title = `Error while sorting: ${errorMessage}`;

      let body = '';

      // Add Array section if available
      if (arrayString !== undefined) {
        body += `**Array:**:\n\n\`\`\`\n${arrayString}\n\`\`\`\n\n`;
      }

      // Add Exception details
      body += `**Exception**:\n\n`;
      body += `Message: ${errorMessage}\n\n`;
      if (error instanceof Error && error.stack !== undefined) {
        body += `Stacktrace:\n\n\`\`\`\n${error.stack}\n\`\`\`\n`;
      }

      // Gather environment and configuration details
      const osPlatform = os.platform();
      const osRelease = os.release();
      const timestamp = new Date().toISOString();
      const extConfig = getExtensionConfiguration();

      // Add Environment details
      body += `---\n`;
      body += `**Environment:**\n`;
      body += `- VS Code Version: ${vscode.version}\n`;
      body += `- Extension Version: ${extensionVersion}\n`;
      body += `- OS: ${osPlatform} (${osRelease})\n`;
      body += `- Timestamp: ${timestamp}\n\n`;

      // Add Extension Configuration
      body += `**Extension Configuration:**\n`;
      body += `\`\`\`json\n${JSON.stringify(extConfig, null, 2)}\n\`\`\`\n`;


      const githubUrl = `${issueBaseUrl}/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      vscode.env.openExternal(vscode.Uri.parse(githubUrl));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      vscode.window.showErrorMessage(`Unknown selection ${selection}`);
    }
  });

  // Must resolve, otherwise vsc will display another error message
  return undefined;
};


function sort(
  extensionContext: vscode.ExtensionContext,
  sortFn: (extensionContext: vscode.ExtensionContext, window: typeof vscode.window,
      workspace: typeof vscode.workspace, array: ArrayItem[]) => Promise<ArrayItem[] | undefined>):
    () => Promise<unknown[] | undefined> {
  return async function() {
    const window = vscode.window;
    const workspace = vscode.workspace;
    // The code you place here will be executed every time your command is executed
    if (window.activeTextEditor == null) {
      return fail(extensionContext, 'No text editor is active');
    } else {
      let text: string | undefined = undefined;
      try {
        const editor = window.activeTextEditor as TextEditor;
        const document = editor.document;
        const fileExtension = FileExtension.getFileExtension(document.fileName);

        let selection: vscode.Range = editor.selection;
        // Must store cursor position before changing selection
        const cursorPosition = (selection as vscode.Selection).active;
        if (selection.isEmpty) {
          selection = await searchEnclosingArray(document, editor.selection, fileExtension);
        }

        text = document.getText(selection); // Assign value to text
        const parsedResult = processAndParseArray(text, fileExtension);
        
        const sortedItems  = await sortFn(extensionContext, window, workspace, parsedResult.items);

        if (sortedItems === undefined) {
          // User aborted somewhere
          return;
        }
        const serializedArray = serializeArray(
            { items: sortedItems, comments: parsedResult.comments, arrayContext: parsedResult.arrayContext },
            fileExtension,
            text,
            calculateIndentOfStartingLine(editor, selection)
        );

        // textEditor.edit doesn't work for custom sort, because the editor is not active when the sorting is triggered.
        // WorkspaceEdit takes care of line endings
        const workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.replace(editor.document.uri, selection, serializedArray);
        const success = await workspace.applyEdit(workspaceEdit);
        if (success) {
          // Restore cursor position
          editor.selection = new vscode.Selection(cursorPosition, cursorPosition);
          // Must not await this otherwise it will hang until the user clicks it away.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          window.showInformationMessage('Successfully sorted array!');
          // Return the sorted items as literal values
          return convertToLiteralValues(sortedItems); // Pass sortedItems to convertToLiteralValues
        } else {
          return fail(extensionContext, 'Could not apply workspace edit', text);
        }
      } catch (error) {
        return fail(extensionContext, error as Error, text);
      }
    }
  };
}

export interface ExtensionApi {
    getGlobalStoragePath: () => string;
    isQuickPickOpen: () => boolean;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): ExtensionApi {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const ascendingSort = vscode.commands.registerCommand('extension.sortJsonArrayAscending', sort(context, sortAscending));
  const descendingSort = vscode.commands.registerCommand('extension.sortJsonArrayDescending', sort(context, sortDescending));
  const customSort = vscode.commands.registerCommand('extension.sortJsonArrayCustom', sort(context, sortCustom));

  context.subscriptions.push(ascendingSort);
  context.subscriptions.push(descendingSort);
  context.subscriptions.push(customSort);

  return {
    getGlobalStoragePath() {
      return context.globalStoragePath;
    },
    // This exists only to make the tests more reliable
    isQuickPickOpen() {
      return isQuickPickOpen(context);
    }
  };
}
