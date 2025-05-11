# Project Summary: vsc-sort-json-array

## Purpose of this Document

To get all the information about how the project works in one place

## Introduction

This project is a Visual Studio Code extension designed to sort JSON and JavaScript arrays directly within the editor.

## Problem Solved

The extension addresses the limitations of standard JSON parsing methods like `JSON.parse`, which are often too restrictive and cannot handle variations commonly found in JavaScript arrays, such as dangling commas or different object property quoting styles

## How it Works

The extension runs through the following steps:

1. Find the array
2. Parse
3. Sort
4. Serialize

### Find the array

If no array is selected, the extension automatically detects the array enclosing the current cursor position ([`../../src/searchEnclosingArray.ts`](../../src/searchEnclosingArray.ts)).

### Parse

It employs a custom parser ([`../../src/parser/parseArray.ts`](../../src/parser/parseArray.ts)) using antlr4 to accurately read JSON/JS arrays, including those with non-standard JSON features like dangling commas and unquoted or single-quoted object properties. 

Notes on the parser: When updating the grammar of the parser [`JSON.g4`](../../src/parser/JSON.g4) you MUST run `npm run antlr4:generate` in the project root to make sure that the grammar is valid and the lexer and parser files are generated.


### Sort
There are two primary methods for sorting, implemented in [`../../src/sortOrder/index.ts`](../../src/sortOrder/index.ts):

1.  **Sorting by Common Property:** For arrays of objects ([`../../src/sortOrder/sortObjects/index.ts`](../../src/sortOrder/sortObjects/index.ts)), the extension can sort based on the values of one or more common properties. It guides the user to select properties until a deterministic sort order is achieved.
2.  **Custom Sort:** Users can define a custom sort function in a temporary TypeScript module ([`../../src/sortCustom/index.ts`](../../src/sortCustom/index.ts)). This module is evaluated on save, and the results are previewed. When the custom sort tab is closed, the function is applied to the original array. This method allows for sorting arrays with mixed types or complex nested structures.

### Serialize

The extension also a custom serialization process ([`../../src/serializeArray.ts`](../../src/serializeArray.ts)) that preserves the type of quotes used for properties. It doesn't preserve whitespace from the input, because it the use of whitespace in array often heavily depends on the position in the array and doesn't make sense after sorting anymore. The current serializer formats similar to how `JSON.stringify(whatever, null, 2)` aligning indentation settings of the editor.


The project includes a comprehensive test suite ([`../../src/test/suite/`](../../src/test/suite/)) to ensure the reliability of its features. This includes unit tests for core logic like parsing ([`../../src/test/suite/processAndParseArray.test.ts`](../../src/test/suite/processAndParseArray.test.ts)) and integration tests for the VS Code extension commands ([`../../src/test/suite/extension.vsc-test.ts`](../../src/test/suite/extension.vsc-test.ts)). When generating test cases you MUST make sure that objects in object array have at least one property in common that can be used for sorting.

## Current Work

Support most common syntax element encountered in arrays where sorting makes sense:
 - Multi-line comments
Find a way to remove the Typescript dependency from the bundle and maybe load it on demand or just strip the types instead of actually compiling to JS

## Rules
- You MUST ignore ESLint errors in your output, I can format it myself later
- You MUST make sure that new features have a sufficient test coverage
- You MUST not use comments in your code, write readable code instead
- You MUST not use comments to tell me what you did or what you are going to do
- You MUST always be as liberal as you can when updating the grammar for the parser and accept as much different input as possible. 
- You MUST always look up the current documentation with a provided MCP server instead of relying on your memory.
- You MUST make sure that you use the newest version when introducing new dependencies or updating old ones. Check the NPM with a MCP server to compare the version here to the defined version
- You MUST make sure that this extension adheres to common best practices for vscode extensions. Consult a documentation server such as context7
- You MUST keep this document up to date and update it if something is no longer true or missing
- You MUST not use vscode imports in the src/parser folder otherwise I can't run them as unit tests outside of vscode