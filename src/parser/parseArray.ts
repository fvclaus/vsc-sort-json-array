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
    // Remove quotes.
    const stringText = ctx.text.slice(1, ctx.toString().length - 1);
    // This is about 10x slower than eval() when converting unicode characters.
    // It is about 2x slower when converting ASCII.
    // I have to decided to keep it, because it aligns better with the grammar.
    return stringTextToStringValue(stringText);
  }
}

const ESCAPE_SEQUENCE_TO_VALUE: {[key in string]: string} = {
  'b': '\b',
  't': '\t',
  'n': '\n',
  // TODO Support
  'v': '\v',
  'f': '\f',
  'r': '\r',
};

export enum STRING_TEXT_MODE {
  TEXT,
  ESCAPE,
  UNICODE
}

function stringTextToStringValue(stringText: string) : string {
  let mode : STRING_TEXT_MODE = STRING_TEXT_MODE.TEXT;
  let stringValue = '';
  for (let i = 0; i < stringText.length; i++) {
    const currentChar = stringText[i];
    switch (mode) {
      case STRING_TEXT_MODE.TEXT: {
        if (currentChar == '\\') {
          mode = STRING_TEXT_MODE.ESCAPE;
        } else {
          stringValue += currentChar;
        }
        break;
      }
      case STRING_TEXT_MODE.ESCAPE: {
        if (currentChar == 'u') {
          mode = STRING_TEXT_MODE.UNICODE;
        } else {
          stringValue += ESCAPE_SEQUENCE_TO_VALUE[currentChar] || currentChar;
          mode = STRING_TEXT_MODE.TEXT;
        }
        break;
      }
      case STRING_TEXT_MODE.UNICODE: {
        const hex = parseInt(stringText.substr(i, 4), 16);
        i += 3;
        stringValue += String.fromCodePoint(hex);
        mode = STRING_TEXT_MODE.TEXT;
        break;
      }
      default: {
        throw new Error(`Unknown mode ${mode}`);
      }
    }
  }
  return stringValue;
}


export {stringTextToStringValue};


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
