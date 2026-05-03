import expressions from "./main.js";
import { filters } from "./main.js";

const { Parser, Lexer } = expressions;

function getFilters(tag: any) {
  return filters[tag];
}

new Parser(new Lexer(), getFilters);
const ppp = new Parser(new Lexer(), getFilters, { csp: true });
const f = expressions.compile("x + 1");
const myResult = f.assign({}, 123);

const result = f({ x: 4 });
const result2 = f({ x: 4 }, { y: 3 });

function validChars(ch: string) {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    ch === "_" ||
    ch === "$" ||
    "ÀÈÌÒÙàèìòùÁÉÍÓÚáéíóúÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüÿß".indexOf(ch) !== -1
  );
}

expressions.compile("être_embarassé", { isIdentifierStart: validChars });

const cache = expressions.compile.cache;
const ast = expressions.compile("foobar").ast;

filters.uppercase = (input: string): string => input.toUpperCase();

expressions.compile("number | square", {
  filters: {
    square: (input: number) => input * input,
  },
  cache: {},
});

expressions.compile("number | square", {
  filters: {
    square: (input: number) => input * input,
  },
  disabledSyntaxes: ["CallExpression"],
  cache: {},
  handleThis: false,
});

new Parser(new Lexer(), getFilters, {
  csp: true,
  disabledSyntaxes: ["CallExpression"],
  handleThis: true,
});
