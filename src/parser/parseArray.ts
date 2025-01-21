/* eslint-disable new-cap */

import {CommonTokenStream, Recognizer, CharStreams, Token} from 'antlr4ts';
import {TerminalNode} from 'antlr4ts/tree';
import {JSONParser, JsonContext, ObjContext, PairContext, ArrContext, ValueContext} from './generated/JSONParser';
import {JSONLexer} from './generated/JSONLexer';
import {ATNSimulator} from 'antlr4ts/atn/ATNSimulator';

export type Pair = [string, unknown];

export const indexSymbol = Symbol("index");
export const contextSymbol = Symbol("context");

// eslint-disable-next-line @typescript-eslint/ban-types
export type ArrayObjectItem = (object | String | Number) & {[indexSymbol]: number, [contextSymbol]: ValueContext};

// eslint-disable-next-line @typescript-eslint/ban-types
export type ArrayItem = (ArrayObjectItem)

// eslint-disable-next-line @typescript-eslint/ban-types
export function convertToLiteralValues(array: ArrayItem[]): (Exclude<ArrayItem, String | Number> | (string | number))[]{
  return array.map(el => {
    if (el instanceof String || el instanceof Number) {
      // Can't use === on String() objects
      return el.valueOf();
    }
    return el;
  })
}

class JsonVisitor {

  visitJson(ctx: JsonContext): ArrayItem[] {
    const arrContext = ctx.arr();
    const array: ArrayItem[] = []
    const valueContexts = arrContext.value();
    let i = 0;
    for (const valueContext of valueContexts) {
      let value = this.visitValue(valueContext);
      if (typeof value === 'string') {
        value = new String(value);
      } else if (typeof value === 'number') {
        value = new Number(value);
      }

      if (value !== null && value !== undefined && typeof value === 'object') {
        const arrayObjectItem = value as ArrayObjectItem;
        arrayObjectItem[indexSymbol] = i;
        arrayObjectItem[contextSymbol] = valueContext;
        array.push(arrayObjectItem);
      } else {
        throw new Error(`Encountered value  '${value}' at position ${i}, but only strings, objects and numbers are supported.`)
      }
      i++;
    }

    return array;
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
export default function parseArray(text: string): ArrayItem[] {
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
