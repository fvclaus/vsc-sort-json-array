import * as ts from 'typescript';
import * as fs from 'fs';

function validateSortFunction(node: ts.FunctionDeclaration): string[] {
    const errors = [];
    if (!node.modifiers || node.modifiers.map(modifier => modifier.kind).indexOf(ts.SyntaxKind.ExportKeyword) == -1) {
        errors.push('Must use export keyword.');
    }
    if (node.parameters.length !== 2) {
        errors.push('Must have exactly two parameters.');
    }
    if (!node.type || node.type.kind !== ts.SyntaxKind.NumberKeyword) {
        errors.push('Must have return type \'number\'.');
    }
    return errors;
}

function compileModule(path: string): ts.Diagnostic[] {
    const program = ts.createProgram([path], {

    })
    let emitResult = program.emit();
    return ts.getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);
}

export function validateSortModule(path: string): string[] {

    const diagnostics = compileModule(path);
    if (diagnostics.length > 0) {
        return ['Does not compile. Please check the problems view.'];
    } else {
        const sourceFile = ts.createSourceFile(path, fs.readFileSync(path).toString(), ts.ScriptTarget.ES2015);
        let errors: string[] = [];
        let hasSortFunction = false;
        sourceFile.forEachChild(node => {
            switch (node.kind) {
                case ts.SyntaxKind.FunctionDeclaration:
                    const functionDeclaration = node as ts.FunctionDeclaration;
                    const functionName = functionDeclaration.name;
                    if (functionName && functionName.escapedText === 'sort') {
                        const sortFunctionErrors = validateSortFunction(functionDeclaration)
                            .map(error => `Sort function is invalid: ${error}`);
                        errors = [...sortFunctionErrors];
                        hasSortFunction = true;
                    }
                    break;
            }
        });
        if (!hasSortFunction) {
            errors.push('Must define a sort(a, b) function.');
        }
        return errors;
    }
}
