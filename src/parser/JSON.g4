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
 // TODO Should support NUMBER as well
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
   : [ \t\n\r] + -> skip
   ;


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
IDENTIFIER
  : [$_\p{ID_Start}][$\p{ID_Continue}]*
;

// handle characters which failed to match any other token
ErrorCharacter : . ;
