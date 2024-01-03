interface LexerOptions {
  isIdentifierStart?: (char: string) => boolean;
  isIdentifierContinue?: (char: string) => boolean;
}

interface ParserOptions {
  csp?: boolean;
  literals?: {
    [x: string]: any;
  };
}

type EvaluatorFunc = {
  (scope?: any, context?: any): any;
  ast: any;
  assign: (scope: any, value: any) => any;
};

type CompileFunc = {
  (tag: string, lexerOptions?: LexerOptions): EvaluatorFunc;
  cache: {
    [x: string]: any;
  };
};

type FilterFunction = (input: any, ...args: any[]) => any;

export const compile: CompileFunc;

export class Lexer {
  constructor(options?: LexerOptions);
}

export const filters: {
  [x: string]: FilterFunction;
};

export class Parser {
  constructor(
    lexer: Lexer,
    filterFunction: (tag: any) => FilterFunction,
    options?: ParserOptions
  );
}
