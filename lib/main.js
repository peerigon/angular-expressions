"use strict";

var parse = require("./parse.js");

var filters = {},
    Lexer = parse.Lexer,
    Parser = parse.Parser,
    lexer = new Lexer({}),
    parser = new Parser(lexer, getFilter);

/**
 * Compiles src and returns a function that executes src on a target object.
 * The compiled function is cached under compile.cache[src] to speed up further calls.
 *
 * @param {string} src
 * @returns {function}
 */
function compile(src) {
    var cached;

    if (typeof src !== "string") {
        throw new TypeError("src must be a string, instead saw '" + typeof src + "'");
    }

    if (!compile.cache) {
        return parser.parse(src);
    }

    cached = compile.cache[src];
    if (!cached) {
        cached = compile.cache[src] = parser.parse(src);
    }

    return cached;
}

/**
 * A cache containing all compiled functions. The src is used as key.
 * Set this on false to disable the cache.
 *
 * @type {object}
 */
compile.cache = {};

/**
 * Just a stub of angular's $filter-method
 *
 * @private
 * @param {string} name
 * @returns {function}
 */
function getFilter(name) {
    return filters[name];
}

exports.Lexer = Lexer;
exports.Parser = Parser;
exports.compile = compile;
exports.filters = filters;