import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';
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
