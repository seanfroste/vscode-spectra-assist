grammar SpectraIn

entry Source:
  (stmts+=Stmt)*;

Stmt:
  stmtName=ID ((arg=Arg)|(paramPair+=ParamPair (paramSep=PARAM_SEP paramPair+=ParamPair)*))?;

Arg:
  (ifCondition=IfCond | titleArg=ANYCHARS);

IfCond:
  '[' ifExpr+=IfExpr ifOperator=OP_CHARS ifExpr+=IfExpr ']';

ParamPair:
  paraName=ID '=' paramVal=ParamValue;

IfExpr:
  expr=ParamValue;

ParamValue:
  val=(ID|NUMERIC|STRING|NUM_FUNC|USER_VAR|USER_STRING);

// Terminal definitions
terminal OP_CHARS: /=|!=|<=?|>=?/;
terminal ID: /[a-zA-Z_][\w]*|%\w+/;
terminal NUMERIC: /-?\d+(\.\d+)?([eE]-?\d+)?/;
terminal USER_VAR: /(@|\$)[a-zA-Z_]\w*/;
terminal USER_STRING: /\$\$[a-zA-Z_]\w*/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal NUM_FUNC: /{[A-Z0-9+\-*/^@()]*}/i;
terminal PARAM_SEP: /[\s,]+/;
terminal ANYCHARS: /[A-Za-z0-9_\- .!@#$%^&*()]+/;

hidden terminal WS: /\s+/;
