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

export const compile: (
  tag: string,
  lexerOptions?: LexerOptions
) => EvaluatorFunc;

export class Lexer {
  constructor(options?: LexerOptions);
}

export class Parser {
  constructor(options?: ParserOptions);
}
