interface LexerOptions {
  isIdentifierStart?: (char: string) => boolean;
  isIdentifierContinue?: (char: string) => boolean;
}

type SyntaxType =
  | "Program"
  | "ExpressionStatement"
  | "AssignmentExpression"
  | "ConditionalExpression"
  | "LogicalExpression"
  | "BinaryExpression"
  | "UnaryExpression"
  | "CallExpression"
  | "FilterExpression"
  | "MemberExpression"
  | "Identifier"
  | "Literal"
  | "ArrayExpression"
  | "Property"
  | "ObjectExpression"
  | "ThisExpression"
  | "LocalsExpression"
  | "NGValueParameter";

interface ParserOptions {
  csp?: boolean;
  literals?: {
    [x: string]: any;
  };
  disabledSyntaxes?: SyntaxType[];
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
  handleThis?: boolean;
  disabledSyntaxes?: SyntaxType[];
  csp?: boolean;
  literals?: {
    [x: string]: any;
  };
  cacheSize?: number;
  maxExpressionLength?: number;
}

type EvaluatorFunc = {
  (scope?: any, context?: any): any;
  ast: any;
  assign: (scope: any, value: any) => any;
};

type BoundCompileFunc = {
  (tag: string): EvaluatorFunc;
};

type CompileFunc = {
  (tag: string, options?: CompileFuncOptions): EvaluatorFunc;
  cache: Cache;
  withOptions(options?: CompileFuncOptions): BoundCompileFunc;
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
