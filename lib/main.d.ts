interface LexerOptions {
  isIdentifierStart?: (char: string) => boolean;
  isIdentifierContinue?: (char: string) => boolean;
}

interface ParserOptions {
  csp?: boolean;
  literals?: {
    [x: string]: any;
  };
  disabledSyntaxes?: string[];
  handleThis?: boolean;
}

interface Filters {
  [x: string]: FilterFunction;
}

interface Cache {
  [x: string]: any;
}

interface CompileFuncOptions extends LexerOptions {
  filters?: Filters;
  cache?: Cache;
  handleThis?: boolean;
  disabledSyntaxes?: string[];
}

type EvaluatorFunc = {
  (scope?: any, context?: any): any;
  ast: any;
  assign: (scope: any, value: any) => any;
};

type CompileFunc = {
  (tag: string, options?: CompileFuncOptions): EvaluatorFunc;
  cache: Cache;
};

type FilterFunction = (input: any, ...args: any[]) => any;

export const compile: CompileFunc;

export class Lexer {
  constructor(options?: LexerOptions);
}

export const filters: Filters;

export class Parser {
  constructor(
    lexer: Lexer,
    filterFunction: (tag: any) => FilterFunction,
    options?: ParserOptions
  );
}
