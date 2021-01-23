/* eslint-disable new-cap */

import {CommonTokenStream, Recognizer, CharStreams, Token} from 'antlr4ts';
import {TerminalNode} from 'antlr4ts/tree';
import {JSONParser, JsonContext, ObjContext, PairContext, ArrContext, ValueContext} from './generated/JSONParser';
import {JSONLexer} from './generated/JSONLexer';
import {ATNSimulator} from 'antlr4ts/atn/ATNSimulator';


type Pair = [string, unknown];

class JsonVisitor {
  visitJson(ctx: JsonContext): unknown[] {
    const arrContext = ctx.arr();
    return this.visitArr(arrContext);
  }
  visitObj(ctx: ObjContext): unknown {
    return ctx.pair()
        .map((pair) => this.visitPair(pair))
        .reduce((obj, pair) => {
          obj[pair[0]] = pair[1];
          return obj;
        }, {} as {[key: string]: unknown});
  }
  visitPair(ctx: PairContext): Pair {
    return [this.evalTerminalNode<string>(ctx.STRING()), this.visitValue(ctx.value())];
  }
  visitArr(ctx: ArrContext): unknown[] {
    return ctx.value()
        .map((value) => this.visitValue(value));
  }
  visitValue(ctx: ValueContext): unknown {
    if (ctx.children == null || ctx.children.length !== 1) {
      throw new Error('Expecting exactly one child');
    }
    if (ctx.children != null) {
      for (const child of ctx.children) {
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
        }
      }
    }
    const child = ctx.getChild(0);

    if (child instanceof ObjContext) {
      return this.visitObj(child);
    } else if (child instanceof ArrContext) {
      return this.visitArr(child);
    } else {
      throw new Error(`Unknown token type ${child.constructor.name}`);
    }
  }

  evalTerminalNode<T= unknown>(ctx: TerminalNode): T {
    return eval(ctx.toString());
  }

  makeString(ctx: TerminalNode): string {
    return ctx.text.slice(1, ctx.toString().length - 1);
  }
}


// Generate antlr classes with npm run antrl4
export default function parseArray(text: string): unknown[] {
  const inputStream = CharStreams.fromString(text);
  const lexer = new JSONLexer(inputStream);
  lexer.removeErrorListeners();
  const tokenStream = new CommonTokenStream(lexer);
  const errors: Error[] = [];
  const parser = new JSONParser(tokenStream);
  parser.removeErrorListeners();
  parser.addErrorListener({
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
