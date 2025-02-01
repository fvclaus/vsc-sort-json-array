// Generated from src/parser/JSON.g4 by ANTLR 4.9.0-SNAPSHOT


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
	public static readonly T__6 = 7;
	public static readonly CLOSING_CURLIES = 8;
	public static readonly OPENING_CURLIES = 9;
	public static readonly COLON = 10;
	public static readonly STRING = 11;
	public static readonly NUMBER = 12;
	public static readonly WS = 13;
	public static readonly IDENTIFIER = 14;
	public static readonly ErrorCharacter = 15;
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
		undefined, "'true'", "'false'", "'null'", "'undefined'", "','", "'['", 
		"']'", "'}'", "'{'", "':'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, "CLOSING_CURLIES", "OPENING_CURLIES", "COLON", "STRING", "NUMBER", 
		"WS", "IDENTIFIER", "ErrorCharacter",
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

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

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
			this.state = 21;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case JSONParser.OPENING_CURLIES:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 13;
				this.obj();
				}
				break;
			case JSONParser.T__5:
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
			case JSONParser.T__3:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 20;
				this.match(JSONParser.T__3);
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
			let _alt: number;
			this.state = 39;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 23;
				this.match(JSONParser.OPENING_CURLIES);
				this.state = 24;
				this.pair();
				this.state = 29;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 1, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 25;
						this.match(JSONParser.T__4);
						this.state = 26;
						this.pair();
						}
						}
					}
					this.state = 31;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 1, this._ctx);
				}
				this.state = 33;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === JSONParser.T__4) {
					{
					this.state = 32;
					this.match(JSONParser.T__4);
					}
				}

				this.state = 35;
				this.match(JSONParser.CLOSING_CURLIES);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 37;
				this.match(JSONParser.OPENING_CURLIES);
				this.state = 38;
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
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 41;
			_la = this._input.LA(1);
			if (!(_la === JSONParser.STRING || _la === JSONParser.IDENTIFIER)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			this.state = 42;
			this.match(JSONParser.COLON);
			this.state = 43;
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
			let _alt: number;
			this.state = 61;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 45;
				this.match(JSONParser.T__5);
				this.state = 46;
				this.value();
				this.state = 51;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 4, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 47;
						this.match(JSONParser.T__4);
						this.state = 48;
						this.value();
						}
						}
					}
					this.state = 53;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 4, this._ctx);
				}
				this.state = 55;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === JSONParser.T__4) {
					{
					this.state = 54;
					this.match(JSONParser.T__4);
					}
				}

				this.state = 57;
				this.match(JSONParser.T__6);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 59;
				this.match(JSONParser.T__5);
				this.state = 60;
				this.match(JSONParser.T__6);
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
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x11B\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x03\x02" +
		"\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x05\x03\x18\n\x03\x03\x04\x03\x04\x03\x04\x03\x04\x07\x04\x1E" +
		"\n\x04\f\x04\x0E\x04!\v\x04\x03\x04\x05\x04$\n\x04\x03\x04\x03\x04\x03" +
		"\x04\x03\x04\x05\x04*\n\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x06\x03" +
		"\x06\x03\x06\x03\x06\x07\x064\n\x06\f\x06\x0E\x067\v\x06\x03\x06\x05\x06" +
		":\n\x06\x03\x06\x03\x06\x03\x06\x03\x06\x05\x06@\n\x06\x03\x06\x02\x02" +
		"\x02\x07\x02\x02\x04\x02\x06\x02\b\x02\n\x02\x02\x03\x04\x02\r\r\x10\x10" +
		"\x02I\x02\f\x03\x02\x02\x02\x04\x17\x03\x02\x02\x02\x06)\x03\x02\x02\x02" +
		"\b+\x03\x02\x02\x02\n?\x03\x02\x02\x02\f\r\x05\n\x06\x02\r\x0E\x07\x02" +
		"\x02\x03\x0E\x03\x03\x02\x02\x02\x0F\x18\x05\x06\x04\x02\x10\x18\x05\n" +
		"\x06\x02\x11\x18\x07\r\x02\x02\x12\x18\x07\x0E\x02\x02\x13\x18\x07\x03" +
		"\x02\x02\x14\x18\x07\x04\x02\x02\x15\x18\x07\x05\x02\x02\x16\x18\x07\x06" +
		"\x02\x02\x17\x0F\x03\x02\x02\x02\x17\x10\x03\x02\x02\x02\x17\x11\x03\x02" +
		"\x02\x02\x17\x12\x03\x02\x02\x02\x17\x13\x03\x02\x02\x02\x17\x14\x03\x02" +
		"\x02\x02\x17\x15\x03\x02\x02\x02\x17\x16\x03\x02\x02\x02\x18\x05\x03\x02" +
		"\x02\x02\x19\x1A\x07\v\x02\x02\x1A\x1F\x05\b\x05\x02\x1B\x1C\x07\x07\x02" +
		"\x02\x1C\x1E\x05\b\x05\x02\x1D\x1B\x03\x02\x02\x02\x1E!\x03\x02\x02\x02" +
		"\x1F\x1D\x03\x02\x02\x02\x1F \x03\x02\x02\x02 #\x03\x02\x02\x02!\x1F\x03" +
		"\x02\x02\x02\"$\x07\x07\x02\x02#\"\x03\x02\x02\x02#$\x03\x02\x02\x02$" +
		"%\x03\x02\x02\x02%&\x07\n\x02\x02&*\x03\x02\x02\x02\'(\x07\v\x02\x02(" +
		"*\x07\n\x02\x02)\x19\x03\x02\x02\x02)\'\x03\x02\x02\x02*\x07\x03\x02\x02" +
		"\x02+,\t\x02\x02\x02,-\x07\f\x02\x02-.\x05\x04\x03\x02.\t\x03\x02\x02" +
		"\x02/0\x07\b\x02\x0205\x05\x04\x03\x0212\x07\x07\x02\x0224\x05\x04\x03" +
		"\x0231\x03\x02\x02\x0247\x03\x02\x02\x0253\x03\x02\x02\x0256\x03\x02\x02" +
		"\x0269\x03\x02\x02\x0275\x03\x02\x02\x028:\x07\x07\x02\x0298\x03\x02\x02" +
		"\x029:\x03\x02\x02\x02:;\x03\x02\x02\x02;<\x07\t\x02\x02<@\x03\x02\x02" +
		"\x02=>\x07\b\x02\x02>@\x07\t\x02\x02?/\x03\x02\x02\x02?=\x03\x02\x02\x02" +
		"@\v\x03\x02\x02\x02\t\x17\x1F#)59?";
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
	public COLON(): TerminalNode { return this.getToken(JSONParser.COLON, 0); }
	public value(): ValueContext {
		return this.getRuleContext(0, ValueContext);
	}
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(JSONParser.IDENTIFIER, 0); }
	public STRING(): TerminalNode | undefined { return this.tryGetToken(JSONParser.STRING, 0); }
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


