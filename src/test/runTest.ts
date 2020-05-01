import * as path from 'path';

import { runTests } from 'vscode-test';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to the extension test script
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		const vscodeVersion = process.env.VSCODE_VERSION || '1.38.0'
		// Download VS Code, unzip it and run the integration test
		// 1.31.0 was first version to provide globalStoragePath.
		// Use 1.38.0, becaues lower version would not close editor when tests are finished. 
		await runTests({ version:vscodeVersion, extensionDevelopmentPath, extensionTestsPath });
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();