/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ObjContext, PairContext, ArrContext, ValueContext } from './parser/generated/JSONParser';
import { CommentInfo, contextSymbol, ParseResult, predecessorLineStopSymbol } from './parser/parseArray';
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

  private visitObjectOrArray(ctx: ObjContext | ArrContext, indentLevel: number, children?: ValueContext[] | PairContext[]): string {
    const buffer: string[] = [];
    const [openingBrackets, closingBrackets] = ctx instanceof ObjContext? ['{', '}'] : ['[', ']'];

    buffer.push(openingBrackets);
    buffer.push(this.addInlineComment(ctx.start.line));
    buffer.push("\n");

    if (children === undefined) {
      children = ctx instanceof ObjContext? ctx.pair() : ctx.value();
    }
    this.visitChildren(children, buffer, indentLevel);

    // Array or object might be empty
    const previousChildOrStartLine = children.length > 0 ? children[children.length - 1].stop!.line : ctx.start.line;
    const commentsAtEnd = this.getLineCommentsBetween(previousChildOrStartLine,
      ctx.stop!.line, indentLevel);
    buffer.push(commentsAtEnd);
    buffer.push(this.makeIndent(indentLevel) + closingBrackets);

    return buffer.join("");
  }


  private visitChildren(children: ParserRuleContext[], buffer: string[], indentLevel: number): void {
    children.forEach((child, index) => {

      const getPredecessorLineStop = (): number => {
        if (child instanceof ValueContext && predecessorLineStopSymbol in child) {
          // Top Level item. May have changed order. Retrieve the the predecessor before sorting
          return (child as any)[predecessorLineStopSymbol] as number;
        } else if (index === 0) {
          // First child, use start token of parent
          return child.parent!.start.line
        } else {
          // Use stop token of previous child
          return children[index - 1].stop!.line;
        }
      }

      buffer.push(this.getLineCommentsBetween(getPredecessorLineStop(), child.start.line, indentLevel));

      if (child instanceof PairContext) {
        buffer.push(this.visitPair(child, indentLevel + 1));
      } else if (child instanceof ValueContext) {
        buffer.push(this.visitValue(child, true, indentLevel + 1));
      }

      if (index < children.length - 1) {
        buffer.push(",");
      }

      buffer.push(this.addInlineComment(child.stop!.line));
      buffer.push("\n");
    });
  }

  private visitPair(ctx: PairContext, indentLevel: number): string {
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

  private visitValue(ctx: ValueContext, topLevelValue: boolean, indentLevel: number): string {
    if (ctx.children == null || ctx.children.length !== 1) {
      throw new Error('Expecting exactly one child');
    }

    const child = ctx.getChild(0);


    const indent = topLevelValue ? this.makeIndent(indentLevel) : '';
    let text : string | null = null;
    if (child instanceof TerminalNode) {
      text = child.symbol.text as string;
    } else if (child instanceof ObjContext || child instanceof ArrContext) {
      text = this.visitObjectOrArray(child, indentLevel);
    } else {
      throw new Error(`Unknown token type ${child.constructor.name}`);
    }

    return indent + text;
  }

  public serializeArray(parseResult: ParseResult, indentLevel: number): string {
    const serializedArray =  this.visitObjectOrArray(parseResult.arrayContext, indentLevel, parseResult.items.map(i => i[contextSymbol]));
    if (this.remainingComments.length > 0) {
      throw new Error(`I don't know where to put the following comments: ${this.remainingComments.map(c => c.text).join(",")}. Aborting`);
    }
    return serializedArray;
  }

  private addInlineComment(line: number): string {
    const comments =  this.consumeComments(c => c.line === line);
    if (comments.length > 1) {
      throw new Error(`Found two inline comments in line ${line}`);
    }

    return comments.length > 0 ? ` ${comments[0].text}` : "";
  }

  private getLineCommentsBetween(
    start: number,
    end: number,
    indentLevel: number
  ): string {
    const comments =  this.consumeComments((c) => (c.line > start && c.line < end))
      .map( c => `${c.text}`).map(c => this.makeIndent(indentLevel + 1) + c);
    if (comments.length > 0) {
      return comments.join("\n") + "\n";
    } else {
      return "";
    }
  }

  private consumeComments(predicate: (c: CommentInfo) => boolean): CommentInfo[] {
    const comments: CommentInfo[] = [];
    for (let i = 0; i < this.remainingComments.length; i++) {
      const comment = this.remainingComments[i];
      if (predicate(comment)) {
        comments.push(comment);
        this.remainingComments.splice(i, 1);
        i--;
      }
    }

    return comments;
  }
}

export default function serializeArrayFromTree(parseResult: ParseResult, fileExtension: FileExtension, text: string,
  {indentLevel, newIndent}: {indentLevel: number, newIndent: string}): string {
  
  const { items, comments: allCommentTokens } = parseResult;

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
    return serializer.serializeArray(parseResult, indentLevel);
  }
}
