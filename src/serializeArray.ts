import {FileExtension} from './fileExtension';
import { Range } from './parser/parseArray';

import * as vscode from 'vscode';

// TODO Too many parameters
export default function serializeArray(array: unknown[], fileExtension: FileExtension, text: string,
  positions: Range[], indexSymbol: symbol, tabSize?: number): string {
  switch (fileExtension) {
    case FileExtension.JSONL: {
      // TODO What about JSON?
      return array.map((element) => JSON.stringify(element))
          .join('\n');
    }
    default: {
      const lines = text.split("\n");

      // TODO Extract an write test
      const getText = ({start, end}: Range): string => {
        const text: string[] = [];
        const prefix = lines[start[0]- 1].substring(0, start[1] - 1);
        const onlyPrecedingWhitespace = prefix.trim().length == 0;
        // TODO This assumes I am reading the whole line
        text.push((onlyPrecedingWhitespace? prefix : '') + lines[start[0] - 1].substring(start[1] - 1));

        for (let i = (start[0] - 1) + 1; i < (end[0] - 1) - 1; i++) {
          text.push(lines[i]);
        }

        if (end[0] > start[0]) {
          // Inclusive end
          text.push(lines[(end[0] - 1)].substring(0, (end[1])));
        }
        return text.join("\n");
      }

      // TODO StringBuffer?
      const serializedArray: string[] = [];
      for (const element of array) {
        if (typeof element === 'object' && element !== null && indexSymbol in element) {
          // TODO Typing?
          const index = (element as any)[indexSymbol]  as number;
          const text = getText(positions[index]);
          serializedArray.push(text);
        } else {
          // TODO We need to transport the information which quotes should be used
          serializedArray.push(String(element));
        }
      }
      // TODO Was it original on more than one line? -> Use newlines
      // TODO New line handling
      return "[\n" + serializedArray.join(",\n") + "\n]";
    }
  }
}
