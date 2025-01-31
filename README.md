# Sort JSON/JS array

Sorts a JSON/JS array by common property or by custom function and replace the array in-place. The array can be selected (must include `[` and `]`). If no selection is present, the extension will try to find an array that is enclosed by the current cursor position.

## What is supported?

This extension contains its own parser, because `JSON.parse` is too restrictive and `eval` doesn't support comments (which is an upcoming feature)

- Arrays: 
  - `number[]`, `string[]` or `object[]`
  - Dangling `,` commas after the last array item
- Objects:
  - Object properties/key can be either unquoted, `'single'` or `"double"` quoted
- Strings: `'single'` and `"double"` quoted
- Numbers: Base 10 numbers with optional exponent
- JSONL: with the same rules as above. Selection of an arbitrary number of lines is supported.

## Demo

#### Sort array of objects ascending or descending by one or more properties to produce a deterministic sort result:  
![Sort by property](doc/sortOrderExample.gif)

#### Sort array using custom function:  
![Sort by custon function](doc/sortCustomExample.gif)

#### Manage sort modules:  
![Sort by custon function](doc/sortCustomModuleManagementExample.gif)


## Features
### Sort number, string or object arrays
String arrays are sorted using the lexicographic order using [Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator). Number arrays are sorted based on their value. Objects are sorted based on one or more properties. The program will ask until the sort is deterministic. There is command for ascending and descending sort. Nested objects and arrays with mixed types are only supported by custom function. 

### Custom sort
Custom sort opens the sort module in another tab. The sort module must be a valid typescript module that exports a `sort(a, b): number` function. Typing of `a` and `b` can be arbitrary. Every time the module is saved, it will be evaluted and applied to the selected array. A preview of the sort function applied to the current array will be displayed in the output view. Any error in the sort module will be displayed as error message. When the sort module (= tab) is closed, it will be applied to the array of the file where the command was triggered. 

For older vscode versions: Opening the sort module in another tab only works properly if preview mode is disabled. Set `workbench.editor.enablePreview` to `false`. There is also some simple module management, including delete and rename functionality. New sort module will always be named `sort.xx.ts`.

Technical: Sort modules are stored in the global storage path location for this extension. This is a folder in your vs code config location.

### Selecting array manually
Selecting an array works well with the `editor.action.smartSelect.grow` keyboard shortcut or a simliar expand-selection shortcut.

If you wish to contribute, check out the [contributing guidelines](./CONTRIBUTING.md).
