import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';
import * as vscode from 'vscode';
// TODO @types/source-map-support breaks the ts compilation
// import * as sourceMapSupport from 'source-map-support';

// sourceMapSupport.install();

function getGlobPattern(testsRoot: string): string {
  // Use this in launch.json to execute the current test file or from the command line
  const MOCHA_TEST_PATTERN = process.env.MOCHA_TEST_PATTERN;
  let globPattern;
  if (MOCHA_TEST_PATTERN != null) {
    const pathToTranspiledModule = MOCHA_TEST_PATTERN
        .replace('src/', 'out/')
        .replace('.ts', '.js');
    globPattern = path.relative(testsRoot, pathToTranspiledModule);
  } else {
    globPattern = '**/**/*.vsc-test.js';
  }

  console.log(`Using glob pattern ${globPattern} to find tests. Override with env variable MOCHA_TEST_PATTERN`);
  return globPattern;
}

export function run(): Promise<void> {
  const timeout = process.env.MOCHA_TIMEOUT != null? parseInt(process.env.MOCHA_TIMEOUT, 10) : 30000;
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    // ts compilation is slow...
    timeout: timeout,
    color: true,
  });

  console.log(`Using timeout ${timeout}. Override with env variable MOCHA_TIMEOUT`);

  // Test root should be absolute path to out/
  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((c, e) => {
    glob(getGlobPattern(testsRoot), {cwd: testsRoot}, (err, files) => {
      if (err != null) {
        return e(err);
      }

      // Add files to the test suite
      files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

      mocha.suite.afterEach(function (this: Mocha.Context) {
        if ((this.currentTest != null) && this.currentTest.state === 'failed') {
          const testName = this.currentTest.fullTitle().replace(/[^a-z0-9]/gi, '_').toLowerCase();
          
          if (process.env.CI != null) {
            if (process.platform === 'linux') {
              const terminal = vscode.window.createTerminal('Screenshot Terminal');
              terminal.sendText(`xwd -display :99 -root -silent | convert xwd:- png:/tmp/vscode_sort_json_${testName}.png`, true);
            } else if (process.platform === 'win32') {
              const terminal = vscode.window.createTerminal({
                name: 'Screenshot Terminal',
                shellPath: 'powershell.exe'
              });
              const psScript = `
[Reflection.Assembly]::LoadWithPartialName("System.Drawing");
function screenshot([Drawing.Rectangle]$bounds, $path) {
   $bmp = New-Object Drawing.Bitmap $bounds.width, $bounds.height;
   $graphics = [Drawing.Graphics]::FromImage($bmp);
   $graphics.CopyFromScreen($bounds.Location, [Drawing.Point]::Empty, $bounds.size);
   $bmp.Save($path);
   $graphics.Dispose();
   $bmp.Dispose();
}
$bounds = [Drawing.Rectangle]::FromLTRB(0, 0, 1000, 900);
screenshot $bounds "$env:TEMP\\vscode_sort_json_${testName}.png";
`.replace(/\n/g, '');
              terminal.sendText(psScript, true);
            }
          }
        }
      });

      try {
        // Run the mocha test
        mocha.run((failures) => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        e(err);
      }
    });
  });
}
