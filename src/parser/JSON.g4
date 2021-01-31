
/** Taken from "The Definitive ANTLR 4 Reference" by Terence Parr */

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
   : STRING COLON value
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
   : ('\\' (["\\/bfnrt] | UNICODE)) |  ~ ["\\\u0000-\u001F]*
   ;

fragment STRINGCHARS_SINGLE
   : ('\\' (['\\/bfnrt] | UNICODE)) |  ~ ['\\\u0000-\u001F]*
   ;

// TODO Template
fragment ESC
   : '\\' (["\\/bfnrt] | UNICODE)
   ;
fragment UNICODE
   : 'u' HEX HEX HEX HEX
   ;
fragment HEX
   : [0-9a-fA-F]
   ;
// TODO Template
fragment SAFECODEPOINT
   : ~ ["\\\u0000-\u001F]
   ;


NUMBER
   : '-'? INT ('.' [0-9] +)? EXP?
   ;


fragment INT
   : '0' | [1-9] [0-9]*
   ;

// no leading zeros

fragment EXP
   : [Ee] [+\-]? INT
   ;

// \- since - means "range" inside [...]

WS
   : [ \t\n\r\u00A0] + -> skip
   ;

// handle characters which failed to match any other token
ErrorCharacter : . ;
