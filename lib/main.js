"use strict";

var parse = require("./parse.js");

var Lexer = parse.Lexer,
    Parser = parse.Parser,
    lexer = new Lexer({}),
    parser = new Parser({});

parser.lexer = lexer;

function compile(src) {
    return parser.parse(src);
}

compile.Lexer = Lexer;
compile.Parser = Parser;

module.exports = compile;