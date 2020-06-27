import * as ts from 'typescript';
import withTempFile from './unlinkTempfile';

function validateSortFunction(node: ts.FunctionDeclaration): string[] {
  const errors = [];
  if (node.modifiers == null || node.modifiers.map((modifier) => modifier.kind).indexOf(ts.SyntaxKind.ExportKeyword) == -1) {
    errors.push('Must use export keyword.');
  }
  if (node.parameters.length !== 2) {
    errors.push('Must have exactly two parameters.');
  }
  if (node.type == null || node.type.kind !== ts.SyntaxKind.NumberKeyword) {
    errors.push('Must have return type \'number\'.');
  }
  return errors;
}


function validateSourceFile(sourceFile: ts.SourceFile) {
  let errors: string[] = [];
  let hasSortFunction = false;
  sourceFile.forEachChild((node) => {
    switch (node.kind) {
      case ts.SyntaxKind.FunctionDeclaration: {
        const functionDeclaration = node as ts.FunctionDeclaration;
        const functionName = functionDeclaration.name;
        if (functionName != null && functionName.escapedText === 'sort') {
          const sortFunctionErrors = validateSortFunction(functionDeclaration)
              .map((error) => `Sort function is invalid: ${error}`);
          errors = [...sortFunctionErrors];
          hasSortFunction = true;
        }
        break;
      }
    }
  });
  if (!hasSortFunction) {
    errors.push('Must define a sort(a, b) function.');
  }
  return errors;
}

export function validateSortModule(path: string): string[] {
  return withTempFile((tempFilePath) => {
    const program = ts.createProgram({
      rootNames: [path], options: {
        outFile: tempFilePath,
        target: ts.ScriptTarget.ES2015,
        module: ts.ModuleKind.System,
      },
    });
    const emitResult = program.emit();
    const diagnostics = ts.getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

    if (diagnostics.length > 0) {
      return ['Does not compile. Please check the problems view.'];
    } else {
      return validateSourceFile(program.getSourceFile(path) as ts.SourceFile);
    }
  }, (e) => [`Does not compile: ${e}`]);
}
