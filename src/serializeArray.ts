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

  private visitObj(ctx: ObjContext, indentLevel: number): string {
    const buffer: string[] = [];
    buffer.push("{");
    buffer.push(this.addInlineComment(ctx.start.line));
    const pairs = ctx.pair();
    this.visitChildren(pairs, buffer, indentLevel,);

    buffer.push(this.getComments(ctx, 
      pairs.length > 0? pairs[pairs.length - 1].stop!.line : ctx.start.line, indentLevel));

    buffer.push(`${this.makeIndent(indentLevel)}}`)

    return buffer.join("");
  }


  private visitChildren(children: ParserRuleContext[], buffer: string[], indentLevel: number): void {
    children.forEach((child, index) => {

      const getPredecessorLineStop = () => {
        if (predecessorLineStopSymbol in (child as any)) {
          // Top Level item. May have changed order. Retrieve the the predecessor before sorting
          return (child as any)[predecessorLineStopSymbol];
        } else if (index === 0) {
          // First child, use start token of parent
          return child.parent!.start.line
        } else {
          // Use stop token of previous child
          return children[index - 1].stop!.line;
        }
      }

      buffer.push(this.getBeforeComments(child, getPredecessorLineStop(), indentLevel));

      if (child instanceof PairContext) {
        buffer.push(this.visitPair(child, indentLevel + 1));
      } else if (child instanceof ValueContext) {
        buffer.push(this.visitValue(child, true, indentLevel + 1));
      }

      if (index < children.length - 1) {
        buffer.push(",");
      }

      buffer.push(this.addInlineComment(child.stop!.line));
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

  private visitArr(ctx: ArrContext, indentLevel: number, children?: ValueContext[]): string {
    const buffer = [];
    buffer.push(`[`);
    buffer.push(this.addInlineComment(ctx.start.line));

    const values = children === undefined? ctx.value() : children;

    this.visitChildren(values, buffer, indentLevel);

    buffer.push(this.getComments(ctx, 
      values.length > 0 ? values[values.length - 1].stop!.line : ctx.start.line, indentLevel));

    buffer.push(`${this.makeIndent(indentLevel)}]`);

    return buffer.join("");
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
    } else if (child instanceof ObjContext) {
      text = this.visitObj(child, indentLevel);
    } else if (child instanceof ArrContext) {
      text = this.visitArr(child, indentLevel);
    } else {
      throw new Error(`Unknown token type ${child.constructor.name}`);
    }

    return indent + text;
  }

  public serializeArray(parseResult: ParseResult, indentLevel: number): string {
    const serializedArray =  this.visitArr(parseResult.arrayContext, indentLevel, parseResult.items.map(i => i[contextSymbol]));
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

    return comments.length > 0 ? ` ${comments[0].text}\n` : "\n";
  }

  private getBeforeComments(ctx: ParserRuleContext, predecessorLineStop: number, indentLevel: number): string {
    const start = ctx.start.line;
    const comments =  this.consumeComments((c) => (c.line < start && c.line > predecessorLineStop))
      .map( c => `${c.text}`).map(c => this.makeIndent(indentLevel + 1) + c);
    if (comments.length > 0) {
      return comments.join("\n") + "\n";
    } else {
      return "";
    }
  }

  private getComments(
    ctx: ParserRuleContext,
    lastChildLineStop: number,
    indentLevel: number
  ): string {
    const end = ctx.stop!.line;
    const comments =  this.consumeComments((c) => (c.line < end && c.line > lastChildLineStop))
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
