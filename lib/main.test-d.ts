import expressions from "./main.js";
import { filters } from "./main.js";

const { Parser } = expressions;

const ppp = new Parser({ csp: true });
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
