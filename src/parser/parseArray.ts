/* eslint-disable new-cap */

import {CommonTokenStream, Recognizer, CharStreams, Token} from 'antlr4ts';
import {TerminalNode} from 'antlr4ts/tree';
import {JSONParser, JsonContext, ObjContext, PairContext, ArrContext, ValueContext} from './generated/JSONParser';
import {JSONLexer} from './generated/JSONLexer';
import {ATNSimulator} from 'antlr4ts/atn/ATNSimulator';


export class Range {

  private _start: [number, number];
  private _end: [number, number];

  constructor([startLine, startColumn]: readonly [number ,number], [endLine, endColumn]: readonly [number, number]) {
    if ([startLine, startColumn, endLine, endColumn].includes(0)) {
      throw new Error(`Index is 1-based`);
    }
    if (startLine > endLine) {
      throw new Error(`startLine ${startLine} must not be larger than endLine ${endLine}`);
    }
    if (startLine === endLine && startColumn > endColumn ) {
      throw new Error(`startColumn ${startColumn} must not be larger than endColumn ${endColumn}`);
    }
    this._start = [startLine, startColumn];
    this._end = [endLine, endColumn];
    
  }
  
  /**
   * @returns 1-based index for line and column
   */
  public get start(): [number, number] {
    return this._start;
  }

  /**
   * @returns 1-based index for line and column
   */
  public get end(): [number, number] {
    return this._end;
  }
}

type Pair = [string, unknown];

// eslint-disable-next-line @typescript-eslint/ban-types
export type SupportedArrayValueType = (object | String | Number | boolean |  null | undefined)

// eslint-disable-next-line @typescript-eslint/ban-types
export function convertToLiteralValues(array: SupportedArrayValueType[]): (Exclude<SupportedArrayValueType, String | Number> | (string | number))[]{
  return array.map(el => {
    if (el instanceof String || el instanceof Number) {
      // Can't use === on String() objects
      return el.valueOf();
    }
    return el;
  })
}

class JsonVisitor {

  visitJson(ctx: JsonContext): [SupportedArrayValueType[], Range[]] {
    const arrContext = ctx.arr();
    const array: SupportedArrayValueType[] = []
    const valueContexts = arrContext.value();
    const positions: Range[] = [];
    for (const valueContext of valueContexts) {
      const value = this.visitValue(valueContext);
      if (typeof value === 'string') {
        // Convert root value strings to Strings so that a [index] property can be attached
        array.push(new String(value));
      } else if (typeof value === 'number') {
        array.push(new Number(value));
      } else {
        array.push(value);
      }
      const startToken = valueContext.start;
      const stopToken = valueContext.stop;
      if (stopToken === undefined) {
        throw new Error(`Unexpected zero length value: ${valueContext.text}`)
      }
      const start = [startToken.line, startToken.charPositionInLine + 1] as const;
      const isStartAndEndTokenIdentical = stopToken.line === startToken.line &&
        stopToken.charPositionInLine === startToken.charPositionInLine;
      const end = [stopToken.line, stopToken.charPositionInLine + 1 +
        (isStartAndEndTokenIdentical ? (valueContext.text.length - 1) : 0)] as const;
      positions.push(new Range(start, end));
    }

    return [array, positions];
  }
  visitObj(ctx: ObjContext): object {
    return ctx.pair()
        .map((pair) => this.visitPair(pair))
        .reduce((obj, pair) => {
          obj[pair[0]] = pair[1];
          return obj;
        }, {} as {[key: string]: unknown});
  }
  visitPair(ctx: PairContext): Pair {
    if (ctx.children == null || ctx.children.length !== 3) {
      throw new Error('Expecting exactly three children');
    }
    // TODO String handling
    return [this.evalTerminalNode(ctx.children[0] as TerminalNode).toString(), this.visitValue(ctx.value())];
  }
  visitArr(ctx: ArrContext): unknown[] {
    const values = ctx.value();

    const array:unknown[] = []
    for (const value of values) {
      array.push(this.visitValue(value));
    }
    return array;
  }
  visitValue(ctx: ValueContext): object | string | number | null | undefined | boolean {
    if (ctx.children == null || ctx.children.length !== 1) {
      throw new Error('Expecting exactly one child');
    }

    const child = ctx.getChild(0);

    if (child instanceof TerminalNode) {
      switch (child.symbol.type) {
        case JSONParser.NUMBER:
          return parseFloat(child.symbol.text as string);
        case JSONParser.STRING:
          return this.makeString(child);
      }
      switch (child.text) {
        case 'null':
          return null;
        case 'true':
          return true;
        case 'false':
          return false;
        case 'undefined':
          return undefined;
      }
    } else if (child instanceof ObjContext) {
      return this.visitObj(child);
    } else if (child instanceof ArrContext) {
      return this.visitArr(child);
    } else {
      throw new Error(`Unknown token type ${child.constructor.name}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  evalTerminalNode(ctx: TerminalNode): String {
    switch (ctx.symbol.type) {
      case JSONParser.IDENTIFIER: {
        return new String(ctx.toString());
      } case JSONParser.STRING: {
        return this.makeString(ctx);
      } default: {
        throw new Error(`Unknown type ${ctx.symbol.type} for node ${ctx.toString()}`)
      }
    }
  }

  makeString(ctx: TerminalNode): string {
    // Remove quotes.
    const stringText = ctx.text.slice(1, ctx.toString().length - 1);
    return stringText;
  }
}



// Generate antlr classes with npm run antlr4
export default function parseArray(text: string): [SupportedArrayValueType[], Range[]] {
  const inputStream = CharStreams.fromString(text);
  const lexer = new JSONLexer(inputStream);
  lexer.removeErrorListeners();
  const tokenStream = new CommonTokenStream(lexer);
  const errors: Error[] = [];
  const parser = new JSONParser(tokenStream);
  parser.removeErrorListeners();
  parser.addErrorListener({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    syntaxError(recognizer: Recognizer<Token, ATNSimulator>, offendingSymbol, line, charPositionInLine, msg, e) {
      errors.push(new Error(msg));
    },
  });
  const jsonContext = parser.json();
  if (errors.length > 0) {
    throw errors[0];
  }
  const visitor = new JsonVisitor();
  return visitor.visitJson(jsonContext);
}
