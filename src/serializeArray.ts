import { ObjContext, PairContext, ArrContext, ValueContext } from './parser/generated/JSONParser';
import { CommentInfo, contextSymbol, ParseResult } from './parser/parseArray';
import { FileExtension } from './fileExtension';
import { TerminalNode } from 'antlr4ts/tree';
import { ParserRuleContext } from 'antlr4ts';

class ArraySerializer {

  private makeIndent(indentLevel: number): string {
    return this.newIndent.repeat(indentLevel);
  }

  private remainingComments: CommentInfo[]
  

  constructor(private newIndent: string, comments: CommentInfo[]) {
    this.remainingComments = comments;
  }

  visitObj(ctx: ObjContext, indentLevel: number): string {
    const buffer = [];
    buffer.push("{\n");

    buffer.push(this.getComments(ctx, "before"));
    buffer.push(`${this.makeIndent(indentLevel)}{\n`);
    const pairs = ctx.pair();
    pairs.forEach((pair, index) => {
      this.visitPair(pair, indentLevel + 1);
      if (index < pairs.length - 1) {
        buffer.push(",")
      }

      buffer.push(` ${this.getComments(pair, 'inline')}`);
    });

    // TODO What about empty Objects;
    buffer.push("\n");

    buffer.push(...this.getComments(ctx, 'end').map(c => `${this.makeIndent(indentLevel)}${c}`));

    buffer.push(`${this.makeIndent(indentLevel)}}`)

    return buffer.join("");
  }
  visitPair(ctx: PairContext, indentLevel: number): string {
    if (ctx.children == null || ctx.children.length !== 3) {
      throw new Error('Expecting exactly three children');
    }

    if (!(ctx.children[0] instanceof TerminalNode)) {
      throw new Error(`Expected first child of pair to be a terminal node.`);
    }

    const key = ctx.children[0].text;

    return `${this.getComments(ctx, 'before')}${this.makeIndent(indentLevel)}${key}: ` + 
      this.visitValue(ctx.value(), false, indentLevel);
  }

  visitArr(ctx: ArrContext, indentLevel: number): string {
    const buffer = [];
    buffer.push(`${this.makeIndent(indentLevel)}[\n`);

    const values = ctx.value();

    values.forEach((value, index) => {
      this.visitValue(value, true, indentLevel + 1);

      if (index < values.length - 1) {
        buffer.push(",")
      }

      buffer.push(` ${this.getComments(value, 'inline')}`);
    });

    // TODO What about empty Objects;
    buffer.push("\n");

    buffer.push(...this.getComments(ctx, 'end').map(c => `${this.makeIndent(indentLevel)}${c}`));

    buffer.push(`${this.makeIndent(indentLevel)}]`);
    return buffer.join("");
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

  private getComments(
    ctx: ParserRuleContext,
    type: 'before' | 'inline' | 'end'
  ): string[] {
    const comments = [];

    for (let i = 0; i < this.remainingComments.length; i++) {
      const comment = this.remainingComments[i];
      const line = comment.line;
      const start = ctx.start!.line;
      const end = ctx.stop!.line;
      if (
        (type === 'before' && line === start - 2) || 
        (type === 'inline' &&  line === start - 1) || 
        (type === 'end' && line < (end - 1))) {
        comments.push(`//${comment.text}\n`);
      } else {
        break;
      }
      this.remainingComments.splice(i, 1);
      i--;
    }

    return comments;
  }
}

export default function serializeArrayFromTree(parseResult: ParseResult, fileExtension: FileExtension, text: string,
  {indentLevel, newIndent}: {indentLevel: number, newIndent: string}): string {
  
  const { items, allCommentTokens } = parseResult;

  if (fileExtension === FileExtension.JSONL) {
    const lines = text.split(/\r?\n/);
    const serializedArrayItems = items.map(value => {
        const valueContext = value[contextSymbol];
        const startToken = valueContext.start;
        return lines[startToken.line - 2];
      })
    return serializedArrayItems.join("\n");
  } else {
    const serializer = new ArraySerializer(newIndent, allCommentTokens);
    const contextValue = items[contextSymbol];
    return serializer.visitArr(contextValue, indentLevel + 1);
  }
}
