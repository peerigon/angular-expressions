"use strict";

var parse = require("./parse.js");

var Lexer = parse.Lexer,
    Parser = parse.Parser,
    lexer = new Lexer({}),
    parser = new Parser(lexer);

function compile(src) {
    var cached = compile.cache[src];

    if (typeof src !== "string") {
        throw new TypeError("src must be a string, instead saw '" + typeof src + "'");
    }

    if (!cached) {
        cached = compile.cache[src] = parser.parse(src);
    }

    return cached;
}

compile.cache = {};

exports.Lexer = Lexer;
exports.Parser = Parser;
exports.compile = compile;