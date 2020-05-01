const rimraf = require('rimraf')
const { exec } = require("child_process");

// Received EBUSY: resource busy or locked, rmdir 'D:\a\vsc-sort-json-array\vsc-sort-json-array' on github
// I don't know whats going on there, but it requires no cleanup anyway
if (!process.env.GITHUB_ACTIONS) {
    rimraf('out/', (err) => {
        if (err) {
            console.error(`Cannot delete out/ folder. Reason: ${err}`)
        }
    })
}


exec("npx tsc --listEmittedFiles -p ./ " + process.argv.slice(2).join(" "), (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});