/* eslint-disable new-cap */

// import {ANTLRInputStream, CommonTokenStream} from 'antlr4ts';
import {CommonTokenStream, ANTLRInputStream} from 'antlr4ts';
import {TerminalNode} from 'antlr4ts/tree';
// import {JSONParser, JsonContext, ObjContext, PairContext, ArrContext, ValueContext, NullContext, TrueContext, FalseContext, NumberContext, StringContext} from './generated/JSONParser';
import {JSONParser} from './generated/JSONParser';
import {JSONLexer} from './generated/JSONLexer';


type Pair = [string, unknown];

// class JsonVisitor {
//   visitJson(ctx: JsonContext): unknown[] {
//     const arrContext = ctx.arr();
//     return this.visitArr(arrContext);
//   }
//   visitObj(ctx: ObjContext): unknown {
//     return ctx.pair()
//         .map((pair) => this.visitPair(pair))
//         .reduce((obj, pair) => {
//           obj[pair[0]] = pair[1];
//           return obj;
//         }, {} as {[key: string]: unknown});
//   }
//   visitPair(ctx: PairContext): Pair {
//     return [this.evalTerminalNode<string>(ctx.STRING()), this.visitValue(ctx.value())];
//   }
//   visitArr(ctx: ArrContext): unknown[] {
//     return ctx.value()
//         .map((value) => this.visitValue(value));
//   }
//   visitValue(ctx: ValueContext): unknown {
//     const child = ctx.getChild(0);

//     if (child instanceof ObjContext) {
//       return this.visitObj(child);
//     } else if (child instanceof ArrContext) {
//       return this.visitArr(child);
//     } else if (child instanceof NullContext) {
//       return null;
//     } else if (child instanceof TrueContext) {
//       return true;
//     } else if (child instanceof FalseContext) {
//       return false;
//     } else if (child instanceof NumberContext) {
//       return this.evalTerminalNode(child as any);
//     } else if (child instanceof StringContext) {
//       return this.makeString(child as any);
//     } else {
//       throw new Error(`Unknown token type ${child.constructor.name}`);
//     }
//   }

//   evalTerminalNode<T= unknown>(ctx: TerminalNode): T {
//     return eval(ctx.toString());
//   }

//   makeString(ctx: TerminalNode): string {
//     return ctx.toString().slice(1, ctx.toString().length - 1);
//   }
// }


// Generate antlr classes with npm run antrl4
export default function parseLooseJson(text: string): unknown[] {
  const inputStream = new ANTLRInputStream(text);
  const lexer = new JSONLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new JSONParser(tokenStream);
  const jsonContext = parser.json();
  //   const visitor = new JsonVisitor();
  //   return visitor.visitJson(jsonContext);
  return [];
}
