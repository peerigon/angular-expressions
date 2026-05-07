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

// How to define all disabledSyntaxes using a set of strings, like disabledSyntaxes: string[]{"CallExpression", "FilterExpression"}
interface CompileFuncOptions extends LexerOptions {
  filters?: Filters;
  cache?: Cache;
  handleThis?: boolean;
  disabledSyntaxes?: SyntaxType[];
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
