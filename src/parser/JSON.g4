/** Taken from "The Definitive ANTLR 4 Reference" by Terence Parr */

// TODO Support comments

// Derived from http://json.org
grammar JSON;

json
   : arr EOF
   ;

value
   : obj
   | arr
   | STRING
   | NUMBER
   | 'true'
   | 'false'
   | 'null'
   | 'undefined'
   ;

obj
   : OPENING_CURLIES pair (',' pair)* ','? CLOSING_CURLIES
   | OPENING_CURLIES CLOSING_CURLIES
   ;

CLOSING_CURLIES: '}';
OPENING_CURLIES: '{';

pair
   : (IDENTIFIER | STRING) COLON value
   ;

COLON: ':';

arr
   : '[' value (',' value)* ','? ']'
   | '[' ']'
   ;

STRING
   : '"' STRINGCHARS_DOUBLE '"'
   | '\'' STRINGCHARS_SINGLE '\''
   ;

fragment STRINGCHARS_DOUBLE
   : ('\\"' | ~["])*
   ;

fragment STRINGCHARS_SINGLE
  : ('\\\'' | ~['])*
   ;


NUMBER
   : '-'? INT ('.' [0-9] +)? EXP?
   ;


fragment INT
   : '0' | [1-9] [0-9]*
   ;


fragment EXP
   : [Ee] [+\-]? INT
   ;

WS
   // \p{Zs}: All kinds of spaces that take up space, but no tabs and line feeds and no zero space
   // U+FEFF: Zero Width No-Break Space 
   // U+000B: Vertical tab
   // U+2028: Line separator
   // U+2029: Paragraph separator
   // U+0085: Next line
   : [ \n\r\t\f\u000B\u2028\u2029\uFEFF\u0085\p{Zs}] + -> skip
   ;


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
IDENTIFIER
  : [$_\p{ID_Start}][$\p{ID_Continue}]*
;

// Single-line comments
LINE_COMMENT : '//' ~[\r\n]* -> channel(HIDDEN);

// handle characters which failed to match any other token
ErrorCharacter : . ;
