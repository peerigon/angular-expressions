"use strict";

var parse = require("./parse.js");

var filters = {};
var Lexer = parse.Lexer;
var Parser = parse.Parser;
var parserOptions = {
    csp: false, // noUnsafeEval,
    expensiveChecks: true,
    literals: { // defined at: function $ParseProvider() {
        true: true,
        false: false,
        null: null,
        /*eslint no-undefined: 0*/
        undefined: undefined
        /* eslint: no-undefined: 1  */
    }
    //isIdentifierStart: undefined, //isFunction(identStart) && identStart,
    //isIdentifierContinue: undefined //isFunction(identContinue) && identContinue
};

var lexer = new Lexer({});
var parser = new Parser(lexer, function getFilter(name) {
    return filters[name];
}, parserOptions);

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

exports.Lexer = Lexer;
exports.Parser = Parser;
exports.compile = compile;
exports.filters = filters;
