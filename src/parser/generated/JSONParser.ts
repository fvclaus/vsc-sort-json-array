// Generated from src/parser/JSON.g4 by ANTLR 4.7.3-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { JSONVisitor } from "./JSONVisitor";


export class JSONParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly T__5 = 6;
	public static readonly CLOSING_CURLIES = 7;
	public static readonly OPENING_CURLIES = 8;
	public static readonly COLON = 9;
	public static readonly STRING = 10;
	public static readonly NUMBER = 11;
	public static readonly WS = 12;
	public static readonly ErrorCharacter = 13;
	public static readonly RULE_json = 0;
	public static readonly RULE_value = 1;
	public static readonly RULE_obj = 2;
	public static readonly RULE_pair = 3;
	public static readonly RULE_arr = 4;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"json", "value", "obj", "pair", "arr",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'true'", "'false'", "'null'", "','", "'['", "']'", "'}'", 
		"'{'", "':'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		"CLOSING_CURLIES", "OPENING_CURLIES", "COLON", "STRING", "NUMBER", "WS", 
		"ErrorCharacter",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(JSONParser._LITERAL_NAMES, JSONParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return JSONParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "JSON.g4"; }

	// @Override
	public get ruleNames(): string[] { return JSONParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return JSONParser._serializedATN; }

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(JSONParser._ATN, this);
	}
	// @RuleVersion(0)
	public json(): JsonContext {
		let _localctx: JsonContext = new JsonContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, JSONParser.RULE_json);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 10;
			this.arr();
			this.state = 11;
			this.match(JSONParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public value(): ValueContext {
		let _localctx: ValueContext = new ValueContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, JSONParser.RULE_value);
		try {
			this.state = 20;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case JSONParser.OPENING_CURLIES:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 13;
				this.obj();
				}
				break;
			case JSONParser.T__4:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 14;
				this.arr();
				}
				break;
			case JSONParser.STRING:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 15;
				this.match(JSONParser.STRING);
				}
				break;
			case JSONParser.NUMBER:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 16;
				this.match(JSONParser.NUMBER);
				}
				break;
			case JSONParser.T__0:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 17;
				this.match(JSONParser.T__0);
				}
				break;
			case JSONParser.T__1:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 18;
				this.match(JSONParser.T__1);
				}
				break;
			case JSONParser.T__2:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 19;
				this.match(JSONParser.T__2);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public obj(): ObjContext {
		let _localctx: ObjContext = new ObjContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, JSONParser.RULE_obj);
		let _la: number;
		try {
			this.state = 35;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 2, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 22;
				this.match(JSONParser.OPENING_CURLIES);
				this.state = 23;
				this.pair();
				this.state = 28;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === JSONParser.T__3) {
					{
					{
					this.state = 24;
					this.match(JSONParser.T__3);
					this.state = 25;
					this.pair();
					}
					}
					this.state = 30;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 31;
				this.match(JSONParser.CLOSING_CURLIES);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 33;
				this.match(JSONParser.OPENING_CURLIES);
				this.state = 34;
				this.match(JSONParser.CLOSING_CURLIES);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public pair(): PairContext {
		let _localctx: PairContext = new PairContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, JSONParser.RULE_pair);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 37;
			this.match(JSONParser.STRING);
			this.state = 38;
			this.match(JSONParser.COLON);
			this.state = 39;
			this.value();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public arr(): ArrContext {
		let _localctx: ArrContext = new ArrContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, JSONParser.RULE_arr);
		let _la: number;
		try {
			this.state = 54;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 4, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 41;
				this.match(JSONParser.T__4);
				this.state = 42;
				this.value();
				this.state = 47;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === JSONParser.T__3) {
					{
					{
					this.state = 43;
					this.match(JSONParser.T__3);
					this.state = 44;
					this.value();
					}
					}
					this.state = 49;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 50;
				this.match(JSONParser.T__5);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 52;
				this.match(JSONParser.T__4);
				this.state = 53;
				this.match(JSONParser.T__5);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x0F;\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x03\x02" +
		"\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x05\x03\x17\n\x03\x03\x04\x03\x04\x03\x04\x03\x04\x07\x04\x1D\n\x04\f" +
		"\x04\x0E\x04 \v\x04\x03\x04\x03\x04\x03\x04\x03\x04\x05\x04&\n\x04\x03" +
		"\x05\x03\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x07\x060" +
		"\n\x06\f\x06\x0E\x063\v\x06\x03\x06\x03\x06\x03\x06\x03\x06\x05\x069\n" +
		"\x06\x03\x06\x02\x02\x02\x07\x02\x02\x04\x02\x06\x02\b\x02\n\x02\x02\x02" +
		"\x02?\x02\f\x03\x02\x02\x02\x04\x16\x03\x02\x02\x02\x06%\x03\x02\x02\x02" +
		"\b\'\x03\x02\x02\x02\n8\x03\x02\x02\x02\f\r\x05\n\x06\x02\r\x0E\x07\x02" +
		"\x02\x03\x0E\x03\x03\x02\x02\x02\x0F\x17\x05\x06\x04\x02\x10\x17\x05\n" +
		"\x06\x02\x11\x17\x07\f\x02\x02\x12\x17\x07\r\x02\x02\x13\x17\x07\x03\x02" +
		"\x02\x14\x17\x07\x04\x02\x02\x15\x17\x07\x05\x02\x02\x16\x0F\x03\x02\x02" +
		"\x02\x16\x10\x03\x02\x02\x02\x16\x11\x03\x02\x02\x02\x16\x12\x03\x02\x02" +
		"\x02\x16\x13\x03\x02\x02\x02\x16\x14\x03\x02\x02\x02\x16\x15\x03\x02\x02" +
		"\x02\x17\x05\x03\x02\x02\x02\x18\x19\x07\n\x02\x02\x19\x1E\x05\b\x05\x02" +
		"\x1A\x1B\x07\x06\x02\x02\x1B\x1D\x05\b\x05\x02\x1C\x1A\x03\x02\x02\x02" +
		"\x1D \x03\x02\x02\x02\x1E\x1C\x03\x02\x02\x02\x1E\x1F\x03\x02\x02\x02" +
		"\x1F!\x03\x02\x02\x02 \x1E\x03\x02\x02\x02!\"\x07\t\x02\x02\"&\x03\x02" +
		"\x02\x02#$\x07\n\x02\x02$&\x07\t\x02\x02%\x18\x03\x02\x02\x02%#\x03\x02" +
		"\x02\x02&\x07\x03\x02\x02\x02\'(\x07\f\x02\x02()\x07\v\x02\x02)*\x05\x04" +
		"\x03\x02*\t\x03\x02\x02\x02+,\x07\x07\x02\x02,1\x05\x04\x03\x02-.\x07" +
		"\x06\x02\x02.0\x05\x04\x03\x02/-\x03\x02\x02\x0203\x03\x02\x02\x021/\x03" +
		"\x02\x02\x0212\x03\x02\x02\x0224\x03\x02\x02\x0231\x03\x02\x02\x0245\x07" +
		"\b\x02\x0259\x03\x02\x02\x0267\x07\x07\x02\x0279\x07\b\x02\x028+\x03\x02" +
		"\x02\x0286\x03\x02\x02\x029\v\x03\x02\x02\x02\x07\x16\x1E%18";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!JSONParser.__ATN) {
			JSONParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(JSONParser._serializedATN));
		}

		return JSONParser.__ATN;
	}

}

export class JsonContext extends ParserRuleContext {
	public arr(): ArrContext {
		return this.getRuleContext(0, ArrContext);
	}
	public EOF(): TerminalNode { return this.getToken(JSONParser.EOF, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return JSONParser.RULE_json; }
	// @Override
	public accept<Result>(visitor: JSONVisitor<Result>): Result {
		if (visitor.visitJson) {
			return visitor.visitJson(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ValueContext extends ParserRuleContext {
	public obj(): ObjContext | undefined {
		return this.tryGetRuleContext(0, ObjContext);
	}
	public arr(): ArrContext | undefined {
		return this.tryGetRuleContext(0, ArrContext);
	}
	public STRING(): TerminalNode | undefined { return this.tryGetToken(JSONParser.STRING, 0); }
	public NUMBER(): TerminalNode | undefined { return this.tryGetToken(JSONParser.NUMBER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return JSONParser.RULE_value; }
	// @Override
	public accept<Result>(visitor: JSONVisitor<Result>): Result {
		if (visitor.visitValue) {
			return visitor.visitValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ObjContext extends ParserRuleContext {
	public OPENING_CURLIES(): TerminalNode { return this.getToken(JSONParser.OPENING_CURLIES, 0); }
	public pair(): PairContext[];
	public pair(i: number): PairContext;
	public pair(i?: number): PairContext | PairContext[] {
		if (i === undefined) {
			return this.getRuleContexts(PairContext);
		} else {
			return this.getRuleContext(i, PairContext);
		}
	}
	public CLOSING_CURLIES(): TerminalNode { return this.getToken(JSONParser.CLOSING_CURLIES, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return JSONParser.RULE_obj; }
	// @Override
	public accept<Result>(visitor: JSONVisitor<Result>): Result {
		if (visitor.visitObj) {
			return visitor.visitObj(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PairContext extends ParserRuleContext {
	public STRING(): TerminalNode { return this.getToken(JSONParser.STRING, 0); }
	public COLON(): TerminalNode { return this.getToken(JSONParser.COLON, 0); }
	public value(): ValueContext {
		return this.getRuleContext(0, ValueContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return JSONParser.RULE_pair; }
	// @Override
	public accept<Result>(visitor: JSONVisitor<Result>): Result {
		if (visitor.visitPair) {
			return visitor.visitPair(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ArrContext extends ParserRuleContext {
	public value(): ValueContext[];
	public value(i: number): ValueContext;
	public value(i?: number): ValueContext | ValueContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ValueContext);
		} else {
			return this.getRuleContext(i, ValueContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return JSONParser.RULE_arr; }
	// @Override
	public accept<Result>(visitor: JSONVisitor<Result>): Result {
		if (visitor.visitArr) {
			return visitor.visitArr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


