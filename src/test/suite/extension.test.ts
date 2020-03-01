import { afterEach } from 'mocha';

import * as vscode from 'vscode'
import chai = require('chai');
import { closeActiveEditor } from './textEditorUtils';
const expect = chai.expect;
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
/* import * as vscode from 'vscode'; */
// import * as myExtension from '../extension';


const window = vscode.window;

suite('Extension Test Suite', () => {
	afterEach(async () => {
		await closeActiveEditor();
	});

	test('Invalid json', async () => {
		const document = await vscode.workspace.openTextDocument({
			language: 'JSON',
			content: '[\'foo, 2, 3]'
		})
		await window.showTextDocument(document);
		await vscode.commands.executeCommand('selectAll');
		let hasError = false;
		try {
			await vscode.commands.executeCommand('extension.sortJsonArrayAscending');
		} catch (e) {
			hasError = true;
			expect(e.message).to.equal('Cannot parse selection as JSON.')
		}
		expect(hasError).to.be.true
	});
});