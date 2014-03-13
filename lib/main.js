"use strict";

var parse = require("./parse.js");

var Lexer = parse.Lexer,
    Parser = parse.Parser,
    lexer = new Lexer({}),
    parser = new Parser(lexer);

function compile(src) {
    if (typeof src !== "string") {
        throw new TypeError("src must be a string, instead saw '" + typeof src + "'");
    }

    return parser.parse(src);
}

exports.Lexer = Lexer;
exports.Parser = Parser;
exports.compile = compile;