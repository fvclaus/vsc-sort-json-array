import * as path from 'path';

import { runTests } from '@vscode/test-electron';

async function main(): Promise<void> {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    const workspacePath = path.resolve(extensionDevelopmentPath, 'src/test/workspace')

    console.log(`Using workspacePath ${workspacePath}`)

    const version = process.env.VSCODE_VERSION != null? process.env.VSCODE_VERSION : '1.72.0';

    // Download VS Code, unzip it and run the integration test
    await runTests({version,
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        workspacePath, 
        "--disable-workspace-trust",
        // Await interference with other plugins
        "--profile-temp",
      ]
    });
  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

void main();
