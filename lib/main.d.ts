interface LexerOptions {
  isIdentifierStart?: (char: string) => boolean;
  isIdentifierContinue?: (char: string) => boolean;
}

interface ParserOptions {
  csp?: boolean;
  expensiveChecks?: boolean;
  literals?: {
    [x: string]: any;
  };
}

type EvaluatorFunc = {
  (scope?: any, context?: any): any;
  ast: any;
};

type CompileFunc = {
    ( tag: string, lexerOptions?: LexerOptions) : EvaluatorFunc;
    cache: {
        [x:string]: any
    }
};

export const compile: CompileFunc;

export class Lexer {
  constructor(options?: LexerOptions);
}

export const filters : {
    [x :string]: (input: any, ...args: any[]) => any;
}

export class Parser {
  constructor(options?: ParserOptions);
}
