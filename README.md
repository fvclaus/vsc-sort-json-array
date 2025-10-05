# Sort JSON/JSONL/JSONC/JS array
<div style="display: flex; flex-direction: row">
<a style="flex-grow: 2" href="https://github.com/fvclaus/vsc-sort-json-array/actions?query=branch%3Amaster">
      <img alt="Badge for test status of master branch" src="https://github.com/fvclaus/vsc-sort-json-array/actions/workflows/ci.yml/badge.svg?branch=master"></a>
<div style="display: flex;">
vscode <a style="margin-left: 5px; margin-right: 5px" href="https://marketplace.visualstudio.com/items?itemName=fvclaus.sort-json-array">
      <img alt="Number of VS Code Marketplace Installs" src="https://img.shields.io/visual-studio-marketplace/i/fvclaus.sort-json-array"></a>
Open VSX <a style="margin-left: 5px" href="https://open-vsx.org/extension/fvclaus/sort-json-array">
    <img alt="Number of Open VSX installs" src="https://img.shields.io/open-vsx/dt/fvclaus/sort-json-array"></a>
</div>
</div>

Sorts a JSON/JSONL/JSONC/JS array by common property or by custom function and replace the array in-place. The array can be selected (must include `[` and `]`). If no selection is present, the extension will try to find an array that is enclosed by the current cursor position.

## Installation

Install through VS Code extensions. Search for `sort js array`

[Visual Studio Code Market Place: Sort JSON/JSONL/JSONC/JS array](https://marketplace.visualstudio.com/items?itemName=fvclaus.sort-json-array)

Can also be installed in VS Code: Launch VS Code Quick Open (Ctrl+P), paste the following command, and press enter.

```
ext install fvclaus.sort-json-array
```

## What is supported?

This extension contains its own parser, because `JSON.parse` is too restrictive and `eval` doesn't support comments and will strip out some information (for example how and if object properties are quoted). The result is a support for a superset of JSON/JSONC/JSONL and a subset of JS.

- Arrays: 
  - `number[]`, `string[]` or `object[]`
  - Dangling `,` commas after the last array item
- Objects:
  - Object properties/key can be either unquoted, `'single'` or `"double"` quoted
- Strings: `'single'` and `"double"` quoted
- Numbers: Base 10 numbers with optional exponent
- Comments:
  - `// Line comments`
  - `/* Block comments stretching multiple lines`
- JSONL: with the same rules as above. Selection of an arbitrary number of lines is supported.
- JSONC: Full support with the same rules as above

## Demo

#### Sort array of objects ascending or descending by one or more properties to produce a deterministic sort result:  
![Sort by property](doc/sortOrderExample.gif)

#### Sort array using custom function:  
![Sort by custom function](doc/sortCustomExample.gif)

#### Manage sort modules:  
![Sort by custom function](doc/sortCustomModuleManagementExample.gif)


## Features
### Sort number, string or object arrays
String arrays are sorted using the lexicographic order using [Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator). Number arrays are sorted based on their value. Objects are sorted based on one or more properties. The program will ask until the sort is deterministic. There is command for ascending and descending sort. Nested objects and arrays with mixed types are only supported by custom function. 

### Custom sort
Custom sort opens the sort module in another tab. The sort module must be a valid typescript module that exports a `sort(a, b): number` function. Typing of `a` and `b` can be arbitrary. Every time the module is saved, it will be evaluated and applied to the selected array. A preview of the sort function applied to the current array will be displayed in the output view. Any error in the sort module will be displayed as error message. When the sort module (= tab) is closed, it will be applied to the array of the file where the command was triggered. 

For older vscode versions: Opening the sort module in another tab only works properly if preview mode is disabled. Set `workbench.editor.enablePreview` to `false`. There is also some simple module management, including delete and rename functionality. New sort module will always be named `sort.xx.ts`.

Technical: Sort modules are stored in the global storage path location for this extension. This is a folder in your vs code config location.

#### Sort `keybindings.json`
The `keybindings.json` can be sorted with this custom sort module:

```ts
interface KeyMapping {
    key: string;
    command: string;
}

export function sort(a: KeyMapping, b: KeyMapping): number {

    const aIsUnassignment = a.command.startsWith("-");
    const bIsUnassignment = b.command.startsWith("-");

    // Put assignments before unassignments
    if (aIsUnassignment !== bIsUnassignment) {
        return aIsUnassignment ? 1 : -1;
    }

    return a.command.localeCompare(b.command);
}
```

### Selecting array manually
Selecting an array works well with the `editor.action.smartSelect.grow` keyboard shortcut or a similar expand-selection shortcut.


### Serialization according to editor settings
This extension supports a custom serialization that uses the indentation and end of line settings of the current editor. It will retain the style of quotation for object properties (none/single/double). Any custom formatting will be removed, because it often dependents on the position in the array (first vs second vs last) and there are too many variations to get it right. Instead, this extension serializes arrays similar to how `JSON.parse` would (also similar to Prettier's formatting).


## Contributing

If you wish to contribute, check out the [contributing guidelines](./CONTRIBUTING.md).
