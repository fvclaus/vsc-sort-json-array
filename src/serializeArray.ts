import { TerminalNode } from 'antlr4ts/tree';
import { ObjContext, PairContext, ArrContext, ValueContext } from './parser/generated/JSONParser';
import { ArrayItem, contextSymbol } from './parser/parseArray';
import { FileExtension } from './fileExtension';

class ArraySerializer {

  private makeIndent(indentLevel: number): string {
    return this.newIndent.repeat(indentLevel);
  }
  constructor(private newIndent: string) {}


  
  visitObj(ctx: ObjContext, indentLevel: number): string {
    
    return `{\n` + ctx.pair()
        .map((pair) => this.visitPair(pair, indentLevel + 1))
        .join(",\n") + `\n${this.makeIndent(indentLevel)}}`;
  }
  visitPair(ctx: PairContext, indentLevel: number): string {
    if (ctx.children == null || ctx.children.length !== 3) {
      throw new Error('Expecting exactly three children');
    }

    if (!(ctx.children[0] instanceof TerminalNode)) {
      throw new Error(`Expected first child of pair to be a terminal node.`);
    }

    const key = ctx.children[0].text;

    return `${this.makeIndent(indentLevel)}${key}: ` + 
          this.visitValue(ctx.value(), false, indentLevel);
  }
  visitArr(ctx: ArrContext, indentLevel: number): string {
    const values = ctx.value();
    return "[\n" + values.map(value => this.visitValue(value, true, indentLevel+ 1))
      .join(",\n") + `\n${this.makeIndent(indentLevel)}]`;
  }
  visitValue(ctx: ValueContext, topLevelValue: boolean, indentLevel: number): string {
    if (ctx.children == null || ctx.children.length !== 1) {
      throw new Error('Expecting exactly one child');
    }

    const child = ctx.getChild(0);


    const indent = topLevelValue ? this.makeIndent(indentLevel) : '';
    let text : string | null = null;

    if (child instanceof TerminalNode) {
      text = child.symbol.text as string;
    } else if (child instanceof ObjContext) {
      text = this.visitObj(child, indentLevel);
    } else if (child instanceof ArrContext) {
      text = this.visitArr(child, indentLevel);
    } else {
      throw new Error(`Unknown token type ${child.constructor.name}`);
    }

    return indent + text;
  }
}


export default function serializeArrayFromTree(array: ArrayItem[], fileExtension: FileExtension, text: string,
  {indentLevel, newIndent}: {indentLevel: number, newIndent: string}): string {
  const visitor = new ArraySerializer(newIndent);
  if (fileExtension === FileExtension.JSONL) {
    const lines = text.split(/\r?\n/);
    const serializedArrayItems = array.map(value => {
        const valueContext = value[contextSymbol];
        const startToken = valueContext.start;
        // To be able to parse JSONL as array two lines at beginning and end were added,
        // therefore we need to subtract the first line and convert the 1-based index to a 0-based index
        return lines[startToken.line - 2];
      })
    return serializedArrayItems.join("\n");
  } else {
    const serializedArrayItems = array.map(value => {
      const contextValue = value[contextSymbol];
      return visitor.visitValue(contextValue, true, indentLevel + 1);
    })
    return '[\n' + serializedArrayItems.join(",\n") + `\n${newIndent.repeat(indentLevel)}]`;
  }
}
